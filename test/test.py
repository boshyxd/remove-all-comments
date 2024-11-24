class TestClass:
    '''
    This is a docstring
    spanning multiple lines
    '''
    def __init__(self):
        self.value = "This is not a # comment"

    def test_method(self):
        """Another docstring style"""
        x = 5
        print(f"Value is: {self.value}")

        '''
        Multi-line comment
        using single quotes
        '''
        y = 10
        return x + y

if __name__ == "__main__":
    test = TestClass()
    result = test.test_method()
    print(f"Result: {result}")