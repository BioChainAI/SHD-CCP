#include "gengine/gengine.h"

bool ge_tile_pack(unsigned form_id, unsigned south_halo, uint64_t payload, ge_tile_t *out) {
    if (form_id > 0xF || south_halo > 0xFF || (payload & ~GE_PAYLOAD_MASK) != 0) {
        return false;
    }
    *out = ((uint64_t)south_halo << GE_SOUTH_HALO_SHIFT) | ((uint64_t)form_id << GE_FORM_ID_SHIFT) | payload;
    return true;
}
