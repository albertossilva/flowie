# Feature: Error handling
#   As a developer I want execute a flow, but my error should be capture

#   Scenario: One Path flows
#     Given a registered function called "firstFlowieItem" that receives "A" and returns "B"
#     And a registered function called "secondFlowieItem" that receives "B" and returns "C"
#     When I execute the flow with error, starting with "A" as initial value
#       """
#       {
#         "pipe": [
#           "firstFlowieItem",
#           "secondFlowieItem"
#         ]
#       }
#       """
