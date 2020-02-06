Feature: Pipe Flow
  As a developer I want execute items in sequence

  Scenario: One Path flows
    Given a registered function called "firstFlowieItem" that receives "A" and returns "B"
     And a registered function called "secondFlowieItem" that receives "B" and returns "C"
     And a registered function called "thirdFlowieItem" that receives "C" and returns "D"
    When I execute the flow starting with "A" as initial value
      """
      {
        "pipe": ["firstFlowieItem", "secondFlowieItem", "thirdFlowieItem" ]
      }
      """
    Then the result is "D"

  Scenario: No registered flow item
    Given a registered function called "firstFlowieItem" that receives "A" and returns "B"
    When I execute the flow starting with "A" as initial value
      """
      {
        "pipe": ["firstFlowieItem", "secondFlowieItem"]
      }
      """
    Then The error field on execute should includes "There is no functions registered"
    And The error field on execute should includes "secondFlowieItem"
