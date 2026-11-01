---
"@lit-material/chart": minor
"@lit-material/chip": minor
"@lit-material/data-table": minor
"@lit-material/dual-list": minor
"@lit-material/table": minor
"@lit-material/router": patch
---

Array data renders on the server: bar chart `data`, line chart `series`, sparkline `values`, chip input `values`, pagination `page-size-options`, dual list `items` and `selected`, and table `columns` and `rows` take a JSON attribute, so server-rendered markup carries the data and hydrates to the same output (a property set on the server never reaches the markup). `lit-material-router-outlet` renders empty on the server instead of throwing for want of `location`, which failed the whole page's render.
