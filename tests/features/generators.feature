Feature: Generators
  As a developer I want use generators function, the steps below a generator will called for every yield of generator

  @runtime
  Scenario: One Generator pipe
    Given a generator function called "myAnimalsGenerator" that receives "animals" and yields:
      """
      ["dog", "cat", "bird"]
      """
    When I create a flow named "myFlow" with "myAnimalsGenerator"
    And I execute the flow "myFlow" with "animals"
    Then the result should be "bird" for flow "myFlow"
