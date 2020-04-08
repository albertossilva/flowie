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
  Scenario: Subflows on piping
    Given a registered function called "oneToTwo" that receives "1" and returns "2"
    Given a registered function called "twoToThree" that receives "2" and returns "3"
    Given a registered function called "threeToFour" that receives "3" and returns "4"
    Given a registered function called "fourToFive" that receives "4" and returns "5"
    Given a registered function called "fiveToSix" that receives "5" and returns "6"
    Given a registered function called "sixToSeven" that receives "6" and returns "7"
    When I create a flow from configuration named "myFlow" with value
      """
      {
        "flows": [
          {
            "flows": [{ "pipe": "oneToTwo" }, { "pipe": "twoToThree" }]
          },
          { "pipe": "threeToFour" },
          {
            "flows": [
              { "pipe": { "pipe": "fourToFive" } },
              { "flows": [{ "pipe": "fiveToSix" }, { "pipe": "sixToSeven" }] }
            ]
          }
        ]
      }
      """
    And I execute the flow from configuration "myFlow" with "1"
    Then the result is "7" for flow from configuration: "myFlow"

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
