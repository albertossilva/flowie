Feature: Pipes
  As a developer I want execute items in sequence

  @runtime
  Scenario: One Simple pipe
    Given a function called "firstFlowieItem" that receives "A" and returns "B"
    When I create a flow named "myFlow" with "firstFlowieItem"
    And I execute the flow "myFlow" with "A"
    Then the result is "B" for flow "myFlow"

  @runtime
  Scenario: Piping more functions
    Given a function called "firstFlowieItem" that receives "A" and returns "B"
    And a function called "secondFlowieItem" that receives "B" and returns "C"
    And a function called "thirdFlowieItem" that receives "C" and returns "D"
    When I create a flow named "myFlow" with "firstFlowieItem"
    And I pipe to "secondFlowieItem" on flow "myFlow"
    And I pipe to "thirdFlowieItem" on flow "myFlow"
    And I execute the flow "myFlow" with "A"
    Then the result is "D" for flow "myFlow"

  @configuration
  Scenario: One Simple pipe
    Given a registered function called "firstFlowieItem" that receives "A" and returns "B"
    When I create a flow from configuration named "myFlow" with value
      """
      {
        "flows": [{ "pipe": { "function": "firstFlowieItem" }}]
      }
      """
    And I execute the flow from configuration "myFlow" with "A"
    Then the result is "B" for flow from configuration: "myFlow"

  @configuration
  Scenario: One Simple pipe
    Given a registered function called "firstFlowieItem" that receives "A" and returns "B"
    Given a registered function called "secondFlowieItem" that receives "B" and returns "C"
    Given a registered function called "thirdFlowieItem" that receives "C" and returns "D"
    When I create a flow from configuration named "myFlow" with value
      """
      {
        "flows": [
          { "pipe": { "function": "firstFlowieItem" }},
          { "pipe": { "function": "secondFlowieItem" }},
          { "pipe": { "function": "thirdFlowieItem" }}
        ]
      }
      """
    And I execute the flow from configuration "myFlow" with "A"
    Then the result is "D" for flow from configuration: "myFlow"
