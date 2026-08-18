package com.dahum.util;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class PackageNameExtractor {

    private static final Pattern PACKAGE_REGEX =
        Pattern.compile("^[a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z0-9_]+){1,}$");

    public static List<String> extractUniquePackages(List<String> ocrTexts) {
        return ocrTexts.stream()
            .map(String::trim)
            .filter(t -> !t.isEmpty())
            .filter(t -> PACKAGE_REGEX.matcher(t).matches())
            .distinct()
            .collect(Collectors.toList());
    }
}