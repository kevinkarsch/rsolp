#! /bin/bash

BUILD_DIR="macosx" #{macosx, linux}
QMAKE_SPEC="macx-g++" #{macx-g++,linux-g++}

qmake -spec ${QMAKE_SPEC} -o ${BUILD_DIR}/Makefile

