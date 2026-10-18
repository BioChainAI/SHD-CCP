cmake_minimum_required(VERSION 3.16)
project(gengine VERSION 0.1.0 LANGUAGES C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

add_library(gengine src/tile.c src/crt_garner.c src/gram_tqf.c)
target_include_directories(gengine PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include>)
if(CMAKE_C_COMPILER_ID MATCHES "GNU|Clang")
  target_compile_options(gengine PRIVATE -Wall -Wextra)
endif()

install(TARGETS gengine EXPORT gengineTargets ARCHIVE DESTINATION lib LIBRARY DESTINATION lib)
install(DIRECTORY include/ DESTINATION include)
install(EXPORT gengineTargets NAMESPACE gengine:: DESTINATION lib/cmake/gengine)

# ── Conformance against SHD-CCP/geometric-engine-spec ────────────────────────
# Resolution order: -DGE_SPEC_DIR, $ENV{GE_SPEC_DIR}, ./spec (submodule),
# ../geometric-engine-spec (sibling checkout).
include(CTest)
if(BUILD_TESTING)
  set(GE_SPEC_DIR "" CACHE PATH "Path to a geometric-engine-spec checkout")
  if(NOT GE_SPEC_DIR AND DEFINED ENV{GE_SPEC_DIR})
    set(GE_SPEC_DIR "$ENV{GE_SPEC_DIR}")
  endif()
  foreach(candidate "${CMAKE_CURRENT_SOURCE_DIR}/spec" "${CMAKE_CURRENT_SOURCE_DIR}/../geometric-engine-spec")
    if(NOT GE_SPEC_DIR AND EXISTS "${candidate}/test_vectors")
      set(GE_SPEC_DIR "${candidate}")
    endif()
  endforeach()

  add_executable(test_unit tests/test_unit.c)
  target_link_libraries(test_unit PRIVATE gengine)
  add_test(NAME unit COMMAND test_unit)

  if(GE_SPEC_DIR)
    add_executable(test_conformance tests/test_conformance.c)
    target_link_libraries(test_conformance PRIVATE gengine)
    add_test(NAME conformance COMMAND test_conformance "${GE_SPEC_DIR}/test_vectors")
  else()
    message(WARNING "geometric-engine-spec not found; conformance test disabled")
  endif()
endif()
