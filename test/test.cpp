#include <iostream>
#include <string>

// Single line comment
class TestClass {
    /* Multi-line comment
       spanning multiple
       lines */
    public:
        TestClass() {
            // Constructor comment
        }

        void testMethod() {
            std::string text = "This is not a // comment";  // But this is a comment
            /* Another block comment */
            std::cout << text << std::endl;
            // Comment /* with nested block */
            int x = 5; /* inline comment */ int y = 10;
        }
};

/*
 * Documentation style
 * comment block
 */
int main() {
    TestClass test;
    test.testMethod();  /// Triple slash comment
    return 0;  /////// Multiple slashes
}
