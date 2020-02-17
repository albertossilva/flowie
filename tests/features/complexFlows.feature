# Feature: Complex Flow
#   As a developer I want execute complex flows

#   Scenario: Pipe and split
#     Given a registered function called "firstFlowieItem" that receives "A" and returns "B"
#      And a registered function called "secondFlowieItem" that receives "B" and returns "C"
#      And a registered function called "thirdFlowieItem" that receives "B" and returns "D"
#     When I execute the flow starting with "A" as initial value
#       """
#       {
#         "pipe": [
#           "firstFlowieItem",
#           {
#             "split": ["secondFlowieItem", "thirdFlowieItem"]
#           }
#         ]
#       }
#       """
#     Then the final result will match
#       """
#       {
#         "result": ["C", "D"]
#       }
#       """

