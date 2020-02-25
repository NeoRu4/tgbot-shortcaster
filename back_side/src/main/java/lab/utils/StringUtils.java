package lab.utils;

public class StringUtils {

    public static String toString(Object obj) {
        try {
            return obj.toString();
        } catch (Exception exp) { }
        return null;
    }

    public static Integer toInteger(String intString) {
        Integer number = null;
        try {
            number = Integer.parseInt(intString);
        } catch (Exception error) {}
        return number;
    }

    public static Long toLong(String intString) {
        Long number = null;
        try {
            number = Long.parseLong(intString);
        } catch (Exception error) {}
        return number;
    }
}
