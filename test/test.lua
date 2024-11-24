-- Function to print a greeting
local function hello()
    print("Hello") -- Outputs "Hello" to console
end

-- Initialize variables
local x = 10 -- Assign 10 to x
local y = 20 -- Assign 20 to y

-- Complex function to demonstrate arithmetic
local function complex()
    -- Add x and y
    local z = x + y
    return z -- Return the sum
end

--[[test comment removal in strings]]
-- String variables to test comment removal in strings
local str = "This is not a -- comment" -- Contains fake comment
local str2 = 'Neither is this -- one' -- Another fake comment

-- Test comment removal
-- This comment should be removed when saving

--[[
    This is a multi-line
    comment in Lua
]]

print("Done") -- Indicate end of script