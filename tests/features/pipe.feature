Feature: Pipe Flow
  As a developer I want execute items in sequence

  Scenario: One Path flows
    Given a registered function called "firstPath" that receives "A" and return "B"
     And a registered function called "secondPath" that receives "B" and return "C"
    When I execute the flow starting with "A"
      """
      {
        "pipe": ["firstPath", "secondPath" ]
      }
      """
    Then the result is "C"
