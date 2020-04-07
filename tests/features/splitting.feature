Feature: Splits
  As a developer I want execute items in paralell

  @runtime
  Scenario: One Simple split
    Given a function called "split1" that receives "A" and returns "B"
    Given a function called "split2" that receives "A" and returns "C"
    When I create a flow named "myFlow" with "split1,split2"
    And I execute the flow "myFlow" with "A"
    Then the result of flow "myFlow" is
      """
      ["B", "C"]
      """

  @runtime
  Scenario: One Async split
    Given a function called "split1" that receives "U" and returns "FOO"
    Given an async function called "asyncSplit2" that receives "U" and resolves with "BAR"
    When I create a flow named "myFlow" with "split1,asyncSplit2"
    And I execute the flow "myFlow" with "U"
    Then the promise result of flow "myFlow" is
      """
      ["FOO","BAR"]
      """

  @runtime
  Scenario: Splitting in the middle of a flow
    Given a function called "firstFlowieItem" that receives "A" and returns "B"
    Given a function called "split1" that receives "B" and returns "B1"
    Given a function called "split2" that receives "B" and returns "B2"
    Given a function called "collectSplit" that returns "final" receiving
      """
      ["B1","B2"]
      """
    When I create a flow named "myFlow" with "firstFlowieItem"
    And I split to "split1,split2" on flow "myFlow"
    And I pipe to "collectSplit" on flow "myFlow"
    And I execute the flow "myFlow" with "A"
    Then the result is "final" for flow "myFlow"

  @configuration
  Scenario: One Simple split
    Given a registered function called "split1" that receives "C" and returns "C1"
    Given a registered function called "split2" that receives "C" and returns "C2"
    When I create a flow from configuration named "myFlow" with value
      """
      {
        "flows": [
          { "split": ["split1", "split2"] }
        ]
      }
      """
    And I execute the flow from configuration "myFlow" with "C"
    Then the result of flow from configuration: "myFlow" is
      """
      ["C1","C2"]
      """

  @configuration
  Scenario: Splitting in the middle of a flow
    Given a registered function called "firstFlowieItem" that receives "A" and returns "B"
    Given a registered function called "split1" that receives "B" and returns "B1"
    Given a registered function called "split2" that receives "B" and returns "B2"
    Given a registered function called "collectSplit" that returns "final" receiving
      """
      ["B1","B2"]
      """
    When I create a flow from configuration named "myFlow" with value
      """
      {
        "flows": [
          { "pipe": "firstFlowieItem" },
          { "split": ["split1", "split2"] },
          { "pipe": "collectSplit" }
        ]
      }
      """
    And I execute the flow from configuration "myFlow" with "A"
    Then the result is "final" for flow from configuration: "myFlow"
