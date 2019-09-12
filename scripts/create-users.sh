#!/bin/bash

for i in {1..200}
do
  echo -ne "Creating user [$i / 200]\033[0K\r"
  curl -s --output /dev/null -X POST -H "Content-Type: application/json" -d "{
    \"email\": \"user${i}@gmail.com\",
    \"pass\": \"11111111\",
    \"firstName\": \"User${i}\",
    \"lastName\": \"Gmail\"
	}" "https://matee-devstack.herokuapp.com/api/auth/registration"
done

echo -ne "\033[0K\r"
echo "Completed"
