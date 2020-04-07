Feature: Pipes
  As a developer I want execute items in sequence

  @runtime
  Scenario: One Simple pipe
    Given a function called "firstFlowieItem" that receives "A" and returns "B"
    When I create a flow named "myFlow" with "firstFlowieItem"
    And I execute the flow "myFlow" with "A"
    Then the result is "B" for flow "myFlow"

  @runtime
  Scenario: One async pipe
    Given an async function called "firstFlowieItem" that receives "A" and resolves with "B"
    When I create a flow named "myFlow" with "firstFlowieItem"
    And I execute the flow "myFlow" with "A"
    Then the promise result is "B" for flow "myFlow"

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
        "flows": [{ "pipe": "firstFlowieItem" }]
      }
      """
    And I execute the flow from configuration "myFlow" with "A"
    Then the result is "B" for flow from configuration: "myFlow"

  @configuration
  Scenario: Piping more functions
    Given a registered function called "firstFlowieItem" that receives "A" and returns "B"
    Given a registered function called "secondFlowieItem" that receives "B" and returns "C"
    Given a registered function called "thirdFlowieItem" that receives "C" and returns "D"
    When I create a flow from configuration named "myFlow" with value
      """
      {
        "flows": [
          { "pipe": "firstFlowieItem" },
          { "pipe": "secondFlowieItem" },
          { "pipe": "thirdFlowieItem" }
        ]
      }
      """
    And I execute the flow from configuration "myFlow" with "A"
    Then the result is "D" for flow from configuration: "myFlow"

  @configuration
  Scenario: Async piping more functions
    Given a registered function called "firstFlowieItem" that receives "X" and returns "Y"
    Given an async registered function called "secondFlowieItem" that receives "Y" and resolves "Z"
    Given a registered function called "thirdFlowieItem" that receives "Z" and returns "W"
    When I create a flow from configuration named "myFlow" with value
      """
      {
        "flows": [
          { "pipe": "firstFlowieItem" },
          { "pipe": "secondFlowieItem" },
          { "pipe": "thirdFlowieItem" }
        ]
      }
      """
    And I execute the flow from configuration "myFlow" with "X"
    Then the promise result is "W" for flow from configuration: "myFlow"
