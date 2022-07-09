#!/bin/bash

cat "src/proxy.js"      | sed -ne '/web-start/,/web-end/ p' > "$1/inject.js"
cat "src/graph.js"      | sed -ne '/web-start/,/web-end/ p' > "$1/inject.js"
cat "src/value.js"      | sed -ne '/web-start/,/web-end/ p' > "$1/inject.js"
cat "src/function.js"   | sed -ne '/web-start/,/web-end/ p' > "$1/inject.js"
cat "src/inject.js"     | sed -ne '/web-start/,/web-end/ p' > "$1/inject.js"
cat "src/inject.js"     | sed -ne '/web-start/,/web-end/ p' > "$1/inject.js"

cat "src/base.js"       | sed -ne '/web-start/,/web-end/ p' > "$1/base.js"

cat "src/js.js"         | sed -ne '/web-start/,/web-end/ p' > "$1/js.js"

cat "$1/inject.js"           >  "$1/oa-inject.js"
cat "$1/base.js"             >> "$1/oa-inject.js"
cat "$1/js.js"               >> "$1/oa-inject.js"
