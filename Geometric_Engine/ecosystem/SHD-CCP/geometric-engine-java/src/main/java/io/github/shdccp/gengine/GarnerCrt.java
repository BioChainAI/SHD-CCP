package io.github.shdccp.gengine;

/** Closed-form Garner CRT over (881, 883, 887) (RFC 02). */
public final class GarnerCrt {
    public static final int M = 690_017_701;
    /** 881^-1 mod 883. */
    private static final int C12 = 441;
    /** (881 * 883)^-1 mod 887. */
    private static final int C123 = 37;

    private GarnerCrt() {}

    public static int r881(int n) { return checked(n) % 881; }
    public static int r883(int n) { return checked(n) % 883; }
    public static int r887(int n) { return checked(n) % 887; }

    public static int decode(int r1, int r2, int r3) {
        if (r1 < 0 || r1 >= 881 || r2 < 0 || r2 >= 883 || r3 < 0 || r3 >= 887) {
            throw new IllegalArgumentException("residue out of range");
        }
        int v2 = (r2 + 883 - r1 % 883) % 883 * C12 % 883;
        int t = (r1 + 881 * v2) % 887;
        int v3 = (r3 + 887 - t) % 887 * C123 % 887;
        return r1 + 881 * v2 + 777_923 * v3;
    }

    private static int checked(int n) {
        if (n < 0 || n >= M) throw new IllegalArgumentException("cubic index out of range: " + n);
        return n;
    }
}
