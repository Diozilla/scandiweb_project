const fetchGraphQL = async (query, variables = {}) => {
  try {
      const response = await fetch('http://localhost/scandiweb/index.php', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              query,
              variables,
          }),
      });

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
          // Log the errors and throw for higher-level handling
          data.errors.forEach((error, index) => {
              console.error(`GraphQL Error ${index + 1}: ${error.message}`);
          });
          throw new Error("GraphQL query failed");
      }

      return data.data;
  } catch (error) {
      console.error("Fetch GraphQL Error:", error);
      throw error; // Re-throw the error for handling at the component level
  }
};

export default fetchGraphQL;
