# Graph Report - src/features/admin  (2026-07-21)

## Corpus Check
- 98 files · ~73,146 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 172 nodes · 4 edges · 168 communities (1 shown, 167 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 157
- Community 158
- Community 159
- Community 160
- Community 161
- Community 162
- Community 163
- Community 164
- Community 165
- Community 166
- Community 167

## God Nodes (most connected - your core abstractions)
1. `BasePayment` - 2 edges
2. `Category` - 1 edges
3. `CategoryNode` - 1 edges
4. `ButtonColors` - 1 edges
5. `AdminState` - 1 edges
6. `CashInPayment` - 1 edges
7. `CashOutPayment` - 1 edges
8. `CategoryForm` - 0 edges
9. `ContractStatus` - 0 edges
10. `ContractModality` - 0 edges

## Surprising Connections (you probably didn't know these)
- `AdminState` --references--> `ButtonColors`  [EXTRACTED]
  planes/hooks/usePlanesAdmin.ts → planes/api/planesAdminApi.ts

## Import Cycles
- None detected.

## Communities (168 total, 167 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.67
Nodes (3): BasePayment, CashInPayment, CashOutPayment

## Knowledge Gaps
- **171 isolated node(s):** `CategoryForm`, `Category`, `CategoryNode`, `ContractStatus`, `ContractModality` (+166 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **167 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `CategoryForm`, `Category`, `CategoryNode` to the rest of the system?**
  _171 weakly-connected nodes found - possible documentation gaps or missing edges._