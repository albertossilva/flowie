Feature: Split Flow
  As a developer I want execute items in parallel

  Scenario: One Path flows
    Given a registered function called "firstFlowieItem" that receives "A" and returns "B"
     And a registered function called "secondFlowieItem" that receives "A" and returns "C"
     And a registered function called "thirdFlowieItem" that receives "A" and returns "D"
    When I execute the flow starting with "A" as initial value
      """
      {
        "split": ["firstFlowieItem", "secondFlowieItem", "thirdFlowieItem" ]
      }
      """
    Then the final result will match
      """
      {
        "result": ["B", "C", "D"]
      }
      """

  Scenario: No registered flow item for split
    Given a registered function called "firstFlowieItem" that receives "A" and returns "B"
    When I execute the flow starting with "A" as initial value
      """
      {
        "split": ["firstFlowieItem", "secondFlowieItem"]
      }
      """
    Then The error field on execute should includes "There is no functions registered"
    And The error field on execute should includes "secondFlowieItem"
