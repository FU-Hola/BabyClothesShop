package com.fptu.project_group2.common.helper;


import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class MessageHelper {

    private static MessageSource messageSource;
    private static final Locale VI_LOCALE = Locale.forLanguageTag("vi");

    public MessageHelper(MessageSource messageSource) {
        MessageHelper.messageSource = messageSource;
    }

    public static String getMessage(String key) {
        return getMessage(key, new Object[]{});
    }

    public static String getMessage(String key, Object... args) {
        try {
            return messageSource.getMessage(key, args, LocaleContextHolder.getLocale());
        } catch (Exception e) {
            try {
                return messageSource.getMessage(key, args, VI_LOCALE);
            } catch (Exception ex) {
                return key;
            }
        }
    }

    public static String getMessageOrDefault(String key, String defaultMessage) {
        try {
            String message = messageSource.getMessage(key, null, null, LocaleContextHolder.getLocale());
            if (message != null) {
                return message;
            }
            return messageSource.getMessage(key, null, defaultMessage, VI_LOCALE);
        } catch (Exception e) {
            return defaultMessage;
        }
    }
}