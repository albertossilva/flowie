Feature: Generators
  As a developer I want use generators function, the steps below a generator will called for every yield of generator

  @runtime
  Scenario: One Generator pipe
    Given a generator function called "myAnimalsGenerator" that receives "animals" and yields:
      """
      ["dog", "cat", "bird"]
      """
    When I create a flow named "natureFlow" with "myAnimalsGenerator"
    And I execute the flow "natureFlow" with "animals"
    Then the result should be "bird" for flow "natureFlow"

  @runtime
  Scenario: More than one generator pipe
    Given a generator function called "myAnimalsGenerator" that receives "animals" and yields:
      """
      ["dog", "cat", "bird"]
      """
    Given a generator function called "myBreedsGenerator" that receives the keys and return the values
      """
      {
        "dog": ["pitbull", "doberman"],
        "cat": ["asian", "highlander", "manx", "Munchkin"],
        "bird": ["parrot", "eagle", "dove"]
      }
      """
    Given a bypass function called "bypass"
    When I create a flow named "natureFlow" with "myAnimalsGenerator"
    And I pipe to "myBreedsGenerator" on flow "natureFlow"
    And I pipe to "bypass" on flow "natureFlow"
    And I execute the flow "natureFlow" with "animals"
    Then the result should be "dove" for flow "natureFlow"

  @configuration
  Scenario: Generator as a subflow on configuration
    Given a registered function called "whatIWant" that receives "question" and returns "elements"
    Given a registered generator function called "myElementsGenerator" that receives "elements" and yields:
      """
      ["fire", "water", "air", "earth"]
      """
    Given a registered generator function called "myDerivatesGenerator" that receives the keys and return the values
      """
      {
        "fire": ["ember", "volcano"],
        "water": ["drop", "ice", "lake", "ocean"],
        "air": ["wind", "hurricane", "smoke"],
        "earth": ["rock"]
      }
      """
    Given a registered bypass function called "bypass"
    Given a registered function called "smash" that receives "rock" and returns "dust"
    When I create a flow from configuration named "elementsSmashingFlow" with value
      """
      {
        "flows": [
          { "pipe": "whatIWant" },
          {
            "flows": [{ "pipe": "myElementsGenerator" }, { "pipe": "myDerivatesGenerator" }, { "pipe": "bypass" }]
          },
          { "pipe": "smash" }
        ]
      }
      """
    And I execute the flow from configuration "elementsSmashingFlow" with "question"
    Then the result should be "dust" for flow from configuration: "elementsSmashingFlow"
