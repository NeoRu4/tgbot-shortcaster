package lab.utils;

public class EnumUtils {

    public static <T extends Enum<T>> T fromString(Class<T> c, String string) {

        if( c != null && string != null ) {
            try {
                return Enum.valueOf(c, string.trim());
            } catch(IllegalArgumentException ex) {
            }
        }
        return null;
    }
}
