// CSS for the active link in the navbar
const style = document.createElement("style");
style.textContent = `
    nav ul li a.active {
        background-color: #555;
        color: #fff;
    }
`;
document.head.appendChild(style);

/// Add event listeners to navbar items to show only the clicked section and focus on the input field if it's the "Chatbot" section
document.querySelectorAll("nav ul li a").forEach((link) => {
   link.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent the default anchor behavior

      // Get the target section ID from the href attribute
      const targetSectionId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetSectionId);

      // Hide all sections
      document.querySelectorAll("section").forEach((section) => {
         section.style.display = "none";
      });

      // Show the target section
      if (targetSection) {
         targetSection.style.display = "block";
      }

      // Remove 'active' class from all links
      document.querySelectorAll("nav ul li a").forEach((navLink) => {
         navLink.classList.remove("active");
      });

      // Add 'active' class to the clicked link
      link.classList.add("active");

      // Focus on the chat input if the "Chatbot" section is clicked
      if (targetSectionId === "chatbot") {
         document.getElementById("chat-input").focus();
      }
   });
});

// Initially hide all sections except the first one
document.addEventListener("DOMContentLoaded", () => {
   document.querySelectorAll("section").forEach((section, index) => {
      section.style.display = index === 0 ? "block" : "none";
   });
});

// Add event listeners to navbar items to show only the clicked section and highlight it
document.querySelectorAll("nav ul li a").forEach((link) => {
   link.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent the default anchor behavior

      // Get the target section ID from the href attribute
      const targetSectionId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetSectionId);

      // Hide all sections
      document.querySelectorAll("section").forEach((section) => {
         section.style.display = "none";
      });

      // Show the target section
      if (targetSection) {
         targetSection.style.display = "block";
      }

      // Remove 'active' class from all links
      document.querySelectorAll("nav ul li a").forEach((navLink) => {
         navLink.classList.remove("active");
      });

      // Add 'active' class to the clicked link
      link.classList.add("active");
   });
});

// Initially show only the first section and set the first link as active
document.addEventListener("DOMContentLoaded", () => {
   const sections = document.querySelectorAll("section");
   sections.forEach((section, index) => {
      section.style.display = index === 0 ? "block" : "none";
   });

   const navLinks = document.querySelectorAll("nav ul li a");
   if (navLinks.length > 0) {
      navLinks[0].classList.add("active");
   }
});

document.getElementById("send-btn").addEventListener("click", async () => {
   const parameters = {
      // This should be an array of user-selected criteria/tags for the configuration
      configuration: Array.from(document.querySelectorAll(".selected-tag")).map(
         (tag) => tag.innerText
      ),

      // This value should be the current value of the ECTS slider
      ects: parseInt(document.getElementById("ects-slider").value, 10),

      // This should be an array of priority course IDs or objects based on user selections
      priority_courses: Array.from(
         document.querySelectorAll(".course-item input:checked")
      ).map((input) => {
         const courseRow = input.closest(".course-item");
         return {
            name: courseRow.querySelector("strong").innerText,
            ects: courseRow.children[2].innerText.split(" ")[0], // Assuming ECTS is the 3rd cell
            language: courseRow.children[3].innerText, // Assuming Language is the 4th cell
            lecturer: courseRow.children[6].innerText, // Assuming Lecturer is the 7th cell
         };
      }),
   };

   const input = document.getElementById("chat-input").value;
   const chatBox = document.getElementById("chat-box");

   if (input) {
      // Display user's message
      chatBox.innerHTML += `<div><strong>You:</strong> ${input}</div>`;

      // Send the message to the backend
      try {
         const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ parameters: parameters, message: input }),
         });
         const data = await response.json();

         // Display ChatGPT's response
         chatBox.innerHTML += `<div><strong>ChatGPT:</strong> ${data.reply}</div>`;
         chatBox.scrollTop = chatBox.scrollHeight;
      } catch (error) {
         console.error("Error:", error);
         chatBox.innerHTML += `<div><strong>Error:</strong> Could not connect to the server.</div>`;
      }

      // Clear input field
      document.getElementById("chat-input").value = "";
   }
});

// Handle "Enter" key press to send the message
document.getElementById("chat-input").addEventListener("keydown", (event) => {
   if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default behavior of Enter (e.g., new line)
      const input = document.getElementById("chat-input").value.trim();

      if (input) {
         document.getElementById("send-btn").click(); // Trigger the click event of the send button
      }
   }
});

// Function to check if the necessary inputs in the "Account" section are filled
function isAccountInfoFilled() {
   const institutionEmail = document
      .getElementById("institution-email")
      ?.value.trim();
   const institutionPassword = document
      .getElementById("additional-password")
      ?.value.trim();
   const institutionName = document.getElementById("university")?.value.trim();

   return institutionEmail && institutionPassword && institutionName;
}

// Function to generate courses from a CSV file
async function generateCoursesFromCSV() {
   const response = await fetch("./assets/courses.csv");
   const csvData = await response.text();
   const rows = csvData.split("\n").slice(1); // Skip the header row

   const courses = rows.map((row) => {
      const [
         name,
         ects,
         language,
         seatsAvailable,
         seatsTotal,
         lecturer,
         dates,
      ] = row.split(",");

      return {
         name: name.trim(),
         ects: parseInt(ects.trim()),
         language: language.trim(),
         seatsAvailable: parseInt(seatsAvailable.trim()),
         seatsTotal: parseInt(seatsTotal.trim()),
         lecturer: lecturer.trim(),
         dates: dates.split(" & ").map((date) => date.trim()),
      };
   });

   return courses;
}

// Create a single tooltip element and append it to the body
const tooltip = document.createElement("div");
tooltip.classList.add("tooltip");
tooltip.style.position = "absolute"; // Ensure the tooltip is positioned relative to the document
tooltip.style.display = "none";
tooltip.style.zIndex = "1000"; // Make sure the tooltip appears above other elements
document.body.appendChild(tooltip);

document.addEventListener("DOMContentLoaded", async () => {
   const coursesList = document.getElementById("courses-list");

   coursesList.innerHTML = "";
   coursesList.style.display = "block";

   // Create table structure
   const table = document.createElement("table");
   table.classList.add("courses-table");
   table.innerHTML = `
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>Course Name</th>
                        <th>ECTS</th>
                        <th>Language</th>
                        <th>Seats Available</th>
                        <th>Seats Total</th>
                        <th>Lecturer</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
   const tbody = table.querySelector("tbody");

   // Generate and display courses
   const courses = await generateCoursesFromCSV();
   courses.forEach((course) => {
      const courseRow = document.createElement("tr");
      courseRow.classList.add("course-item");
      courseRow.innerHTML = `
                    <td><input type="checkbox" class="star-checkbox" /></td>
                    <td><strong>${course.name}</strong></td>
                    <td>${course.ects} ECTS</td>
                    <td>${course.language}</td>
                    <td>${course.seatsAvailable}</td>
                    <td>${course.seatsTotal}</td>
                    <td>${course.lecturer}</td>
               `;

      // Show and populate the tooltip on hover with all dates
      courseRow.addEventListener("mouseenter", (event) => {
         tooltip.innerHTML = `
                      <h4>${course.name} Dates</h4>
                      <ul>
                          ${course.dates
                             .map(
                                (date, index) =>
                                   `<li>${
                                      date.charAt(0).toUpperCase() +
                                      date.slice(1)
                                   }</li>`
                             )
                             .join("")}
                      </ul>
                  `;
         tooltip.style.display = "block";
      });

      // Update the tooltip's position as the mouse moves
      courseRow.addEventListener("mousemove", (event) => {
         const offsetX = 15; // Distance from the mouse cursor
         const offsetY = 15;
         tooltip.style.left = `${event.pageX + offsetX}px`;
         tooltip.style.top = `${event.pageY + offsetY}px`;
      });

      // Hide the tooltip when the mouse leaves
      courseRow.addEventListener("mouseleave", () => {
         tooltip.style.display = "none";
      });

      // Add click event to the entire row (except for the checkbox itself)
      courseRow.addEventListener("click", (event) => {
         if (!event.target.matches("input")) {
            const checkbox = courseRow.querySelector(".star-checkbox");
            checkbox.checked = !checkbox.checked;
         }
      });

      tbody.appendChild(courseRow);
   });

   // Append the table to the coursesList container
   coursesList.appendChild(table);

   const suggestionsBox = document.getElementById("suggestions");
   const configurationBox = document.getElementById("selected-tags");

   // Function to move tags between boxes
   function moveTag(tag, fromBox, toBox) {
      fromBox.removeChild(tag);
      toBox.appendChild(tag);
   }

   // Function to generate a pastel color
   function getRandomPastelColor() {
      const hue = Math.floor(Math.random() * 360);
      const saturation = 50 + Math.random() * 30; // Lower saturation for softer colors
      const lightness = 70 + Math.random() * 10; // Higher lightness for pastel effect

      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
   }

   // Add event listeners to all tags
   document.querySelectorAll(".tag").forEach((tag) => {
      const color1 = getRandomPastelColor();
      const color2 = getRandomPastelColor();
      tag.style.background = `linear-gradient(45deg, ${color1}, ${color2})`;

      tag.addEventListener("click", () => {
         if (tag.parentElement.id === "suggestions") {
            moveTag(tag, suggestionsBox, configurationBox);
            tag.classList.add("selected-tag");
         } else {
            moveTag(tag, configurationBox, suggestionsBox);
            tag.classList.remove("selected-tag");
         }
      });
   });

   const navItems = document.querySelectorAll(
      'nav ul li a[href="#strategy"], nav ul li a[href="#priority-courses"], nav ul li a[href="#chatbot"]'
   );
   const institutionEmail = document.getElementById("institution-email");
   const institutionPassword = document.getElementById("additional-password");
   const institutionName = document.getElementById("university");

   // Function to check if the institution details are filled
   function isInstitutionDetailsFilled() {
      return (
         institutionEmail.value.trim() !== "" &&
         institutionPassword.value.trim() !== "" &&
         institutionName.value.trim() !== ""
      );
   }

   // Function to enable or disable nav items
   function updateNavItems() {
      const detailsFilled = isInstitutionDetailsFilled();
      navItems.forEach((navItem) => {
         if (detailsFilled) {
            navItem.classList.remove("disabled");
            navItem.style.pointerEvents = "auto"; // Enable click
            navItem.style.opacity = "1"; // Full opacity for enabled look
         } else {
            navItem.classList.add("disabled");
            navItem.style.pointerEvents = "none"; // Disable click
            navItem.style.opacity = "0.5"; // Reduced opacity for disabled look
         }
      });
   }

   // Add event listeners to check the input fields when they change
   institutionEmail.addEventListener("input", updateNavItems);
   institutionPassword.addEventListener("input", updateNavItems);
   institutionName.addEventListener("change", updateNavItems);

   // Initial check on page load
   updateNavItems();
});

function updateECTSValue(value) {
   document.getElementById("ects-value").textContent = `${value} ECTS`;
}
