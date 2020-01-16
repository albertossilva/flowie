Feature: Reporting
  As a developer, I want to have a report of flow executions

  Scenario: Reporting times
    Given a registered function called "itTakes20millisecond" that takes 20 millisecond(s)
      And a registered function called "itTakes25millisecond" that takes 25 millisecond(s)
    When I execute the flow starting with "A"
      """
      {
        "pipe": ["itTakes20millisecond", "itTakes25millisecond" ]
      }
      """
    Then the final execution time result will be about 45 millisecond(s)
     And the execution time of function "itTakes20millisecond" is about 20 millisecond(s)
     And the execution time of function "itTakes25millisecond" is about 25 millisecond(s)
