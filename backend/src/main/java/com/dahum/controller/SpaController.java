package com.dahum.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {
    @RequestMapping(value = {"/", "/family", "/analysis", "/result", "/my"})
    public String index() {
        return "forward:/index.html";
    }
}
