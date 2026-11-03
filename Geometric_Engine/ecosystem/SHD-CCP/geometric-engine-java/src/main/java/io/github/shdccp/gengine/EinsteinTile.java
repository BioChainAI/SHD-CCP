package io.github.shdccp.gengine;

/**
 * 64-bit Einstein Tile (RFC 01, draft layout): Form ID bits 36-39, South Halo bits 56-63.
 *
 * <p>Tiles are carried as primitive {@code long}s; every accessor is static so hot paths never
 * allocate.
 */
public final class EinsteinTile {
    public static final int FORM_ID_SHIFT = 36;
    public static final long FORM_ID_MASK = 0xFL << FORM_ID_SHIFT;
    public static final int SOUTH_HALO_SHIFT = 56;
    public static final long SOUTH_HALO_MASK = 0xFFL << SOUTH_HALO_SHIFT;
    public static final long PAYLOAD_MASK = ~(FORM_ID_MASK | SOUTH_HALO_MASK);

    private EinsteinTile() {}

    public static int formId(long tile) {
        return (int) ((tile >>> FORM_ID_SHIFT) & 0xF);
    }

    public static int southHalo(long tile) {
        return (int) (tile >>> SOUTH_HALO_SHIFT);
    }

    public static long payload(long tile) {
        return tile & PAYLOAD_MASK;
    }

    public static long pack(int formId, int southHalo, long payload) {
        if (formId < 0 || formId > 0xF) throw new IllegalArgumentException("form id out of range: " + formId);
        if (southHalo < 0 || southHalo > 0xFF) throw new IllegalArgumentException("south halo out of range: " + southHalo);
        if ((payload & ~PAYLOAD_MASK) != 0) throw new IllegalArgumentException("payload overlaps reserved bits");
        return ((long) southHalo << SOUTH_HALO_SHIFT) | ((long) formId << FORM_ID_SHIFT) | payload;
    }
}
