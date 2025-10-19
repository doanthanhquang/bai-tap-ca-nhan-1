$(document).ready(function () {
  // Original text content
  let originalText = $("#text-content").html();
  let currentHighlightStyle = {
    bold: false,
    italic: false,
    underline: false,
    bgColor: "#ffff00",
    textColor: "#ff0000",
  };
  // ========== PROCESS TEXT FUNCTIONALITY ==========
  // Highlight button
  $("#highlight-btn").click(function () {
    const pattern = $("#pattern-input").val();
    if (!pattern) {
      alert("Please enter a pattern to highlight");
      return;
    }

    let content = $("#text-content").html();
    // Remove existing highlights first to avoid nested spans
    content = content.replace(
      /<span class="highlight[^"]*"[^>]*>(.*?)<\/span>/g,
      "$1"
    );

    // Escape special regex characters except for the ones we want to support
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Create regex with global flag for multiple matches (case sensitive)
    const regex = new RegExp(escapedPattern, "g");

    // Build style classes
    let styleClasses = "highlight";
    if (currentHighlightStyle.bold) styleClasses += " bold";
    if (currentHighlightStyle.italic) styleClasses += " italic";
    if (currentHighlightStyle.underline) styleClasses += " underline";

    // Apply highlighting
    content = content.replace(regex, function (match) {
      return `<span class="${styleClasses}" style="background-color: ${currentHighlightStyle.bgColor}; color: ${currentHighlightStyle.textColor}">${match}</span>`;
    });

    $("#text-content").html(content);
  });

  // Delete button
  $("#delete-btn").click(function () {
    const pattern = $("#pattern-input").val();
    if (!pattern) {
      alert("Please enter a pattern to delete");
      return;
    }

    let content = $("#text-content").html();
    // Remove existing highlights first
    content = content.replace(
      /<span class="highlight[^"]*"[^>]*>(.*?)<\/span>/g,
      "$1"
    );

    // Escape special regex characters
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Create regex with global flag (case sensitive)
    const regex = new RegExp(escapedPattern, "g");

    // Delete all matches
    content = content.replace(regex, "");

    $("#text-content").html(content);
  });

  // Reset button
  $("#reset-btn").click(function () {
    $("#text-content").html(originalText);
    $("#pattern-input").val("");
  });

  $("#settings-btn").click(function (e) {
    e.stopPropagation();
    $("#style-modal").toggleClass("show");
  });

  // Close modal when clicking outside
  $(document).click(function (event) {
    if (!$(event.target).closest(".settings-wrapper").length) {
      $("#style-modal").removeClass("show");
    }
  });

  // Function to update sample text preview
  function updateSampleTextPreview() {
    const styles = {
      "font-weight": currentHighlightStyle.bold ? "bold" : "normal",
      "font-style": currentHighlightStyle.italic ? "italic" : "normal",
      "text-decoration": currentHighlightStyle.underline ? "underline" : "none",
      "background-color": currentHighlightStyle.bgColor,
      color: currentHighlightStyle.textColor,
    };

    // Apply to main display
    $("#sample-text-display").css(styles);
  }

  $("#bold-check").change(function () {
    currentHighlightStyle.bold = $(this).is(":checked");
    updateSampleTextPreview();
  });

  $("#italic-check").change(function () {
    currentHighlightStyle.italic = $(this).is(":checked");
    updateSampleTextPreview();
  });

  $("#underline-check").change(function () {
    currentHighlightStyle.underline = $(this).is(":checked");
    updateSampleTextPreview();
  });

  $("#bg-color").on("input change", function () {
    currentHighlightStyle.bgColor = $(this).val();
    updateSampleTextPreview();
  });

  $("#text-color").on("input change", function () {
    currentHighlightStyle.textColor = $(this).val();
    updateSampleTextPreview();
  });

  // Initialize sample text preview
  updateSampleTextPreview();

  // ========== DRAG & DROP FUNCTIONALITY (Animals) ==========

  let draggedAnimal = null;
  let placeholder = null;

  // Add New button
  $("#add-new-btn").click(function () {
    const selectedOption = $("#animal-select option:selected");
    const animalIcon = selectedOption.text();
    const animalName = selectedOption.val();

    // Create new animal item
    const newAnimal = $(`
          <div class="animal-item" data-animal="${animalName}">
              <span class="animal-icon">${animalIcon}</span>
              <span class="animal-name">${animalName}</span>
          </div>
      `);

    // Append to drop zone
    $("#drop-zone").append(newAnimal);

    // Attach drag events to new item
    attachAnimalDragEvents(newAnimal);
  });
  // Function to attach drag events to animal items
  function attachAnimalDragEvents(element) {
    element.on("mousedown", function (e) {
      e.preventDefault();
      draggedAnimal = $(this);

      // Calculate offset from mouse to element's top-left corner
      const elementOffset = draggedAnimal.offset();
      const offsetX = e.pageX - elementOffset.left;
      const offsetY = e.pageY - elementOffset.top;

      let isDragging = false;
      let clone = null;
      const startX = e.pageX;
      const startY = e.pageY;
      const threshold = 2; // Minimum pixels to move before considering it a drag

      // Mouse move handler
      $(document).on("mousemove.animalDrag", function (e) {
        const deltaX = Math.abs(e.pageX - startX);
        const deltaY = Math.abs(e.pageY - startY);

        // Only start dragging if moved beyond threshold
        if (!isDragging && (deltaX > threshold || deltaY > threshold)) {
          isDragging = true;
          draggedAnimal.addClass("dragging");

          // Create placeholder
          placeholder = $('<div class="animal-placeholder"></div>');
          placeholder.css({
            width: draggedAnimal.outerWidth() + "px",
            height: draggedAnimal.outerHeight() + "px",
          });

          // Insert placeholder at dragged item's position
          draggedAnimal.after(placeholder);

          // Create clone for visual feedback
          clone = draggedAnimal.clone();
          clone.removeClass("dragging").addClass("animal-clone");
          clone.css({
            position: "fixed",
            left: e.clientX - offsetX,
            top: e.clientY - offsetY,
            width: draggedAnimal.width(),
            zIndex: 1000,
            opacity: 0.9,
            pointerEvents: "none",
          });
          $("body").append(clone);
        }

        if (isDragging && clone) {
          // Update clone position using the same offset
          clone.css({
            left: e.clientX - offsetX,
            top: e.clientY - offsetY,
          });

          // Find element under cursor
          const elementBelow = $(
            document.elementFromPoint(e.clientX, e.clientY)
          );
          const dropZone = $("#drop-zone");
          const dropZoneRect = dropZone[0].getBoundingClientRect();
          const mouseY = e.clientY;
          const mouseX = e.clientX;

          // Always update placeholder position when in drop zone
          const allAnimals = dropZone.children(".animal-item:not(.dragging)");

          if (allAnimals.length === 0) {
            // No other animals, just append placeholder
            dropZone.append(placeholder);
          } else {
            let insertBefore = null;
            let minDistance = Infinity;

            // Find the closest animal based on position
            allAnimals.each(function () {
              const rect = this.getBoundingClientRect();
              const itemCenterX = rect.left + rect.width / 2;
              const itemCenterY = rect.top + rect.height / 2;

              // Calculate distance from mouse to item center
              const distance = Math.sqrt(
                Math.pow(mouseX - itemCenterX, 2) +
                  Math.pow(mouseY - itemCenterY, 2)
              );

              // Check if mouse is before this item (reading order: left to right, top to bottom)
              const isAbove = mouseY < itemCenterY;
              const isSameRow =
                Math.abs(mouseY - itemCenterY) < rect.height / 2;
              const isLeft = mouseX < itemCenterX;

              if (isAbove || (isSameRow && isLeft)) {
                if (distance < minDistance) {
                  minDistance = distance;
                  insertBefore = $(this);
                }
              }
            });

            // Move placeholder to the calculated position
            if (insertBefore && insertBefore.length > 0) {
              // Check if placeholder is already in the right position
              if (insertBefore.prev()[0] !== placeholder[0]) {
                insertBefore.before(placeholder);
              }
            } else {
              // Insert at the end if not before any item
              if (dropZone.children().last()[0] !== placeholder[0]) {
                dropZone.append(placeholder);
              }
            }
          }
        }
      });

      // Mouse up handler
      $(document).on("mouseup.animalDrag", function (e) {
        // Clean up
        $(document).off("mousemove.animalDrag mouseup.animalDrag");

        if (isDragging) {
          if (clone) {
            clone.remove();
          }

          if (draggedAnimal && placeholder) {
            // Move dragged item to placeholder position
            placeholder.before(draggedAnimal);
            placeholder.remove();
            draggedAnimal.removeClass("dragging");

            placeholder = null;
          }
        }

        draggedAnimal = null;
      });
    });
  }

  // Attach drag events to initial animal items
  $(".animal-item").each(function () {
    attachAnimalDragEvents($(this));
  });

  // ========== DRAG & DROP SIDEBAR ==========

  let draggedNews = null;

  // Expand/Collapse functionality
  $(".expand-icon").on("click", function (e) {
    e.stopPropagation();
    const newsItem = $(this).closest(".news-item");
    newsItem.toggleClass("expanded");

    // Active when expanded
    if (newsItem.hasClass("expanded")) {
      newsItem.addClass("active");
    } else {
      newsItem.removeClass("active");
    }
  });

  // Click on news header to expand and activate
  $(".news-header").on("click", function (e) {
    // Don't trigger if clicking on expand icon or drag handle
    if (
      $(e.target).hasClass("expand-icon") ||
      $(e.target).hasClass("drag-handle")
    ) {
      return;
    }

    const newsItem = $(this).closest(".news-item");

    // Toggle expanded state
    newsItem.toggleClass("expanded");

    // Active when expanded
    if (newsItem.hasClass("expanded")) {
      newsItem.addClass("active");
    } else {
      newsItem.removeClass("active");
    }
  });

  // Drag functionality - only on drag handle
  function attachNewsDragEvents(element) {
    element.find(".drag-handle").on("mousedown", function (e) {
      e.preventDefault();
      e.stopPropagation();

      draggedNews = element;
      draggedNews.addClass("dragging");

      // Calculate offset from mouse to element's top-left corner
      const elementOffset = draggedNews.offset();
      const offsetX = e.pageX - elementOffset.left;
      const offsetY = e.pageY - elementOffset.top;

      // Create clone for visual feedback
      const clone = draggedNews.clone();
      clone.css({
        position: "fixed",
        left: e.clientX - offsetX,
        top: e.clientY - offsetY,
        width: draggedNews.width(),
        zIndex: 1000,
        opacity: 0.8,
        pointerEvents: "none",
      });
      $("body").append(clone);

      // Mouse move handler
      $(document).on("mousemove.newsDrag", function (e) {
        // Update clone position using the same offset
        clone.css({
          left: e.clientX - offsetX,
          top: e.clientY - offsetY,
        });

        // Find element under cursor
        const elementBelow = $(document.elementFromPoint(e.clientX, e.clientY));
        const targetNews = elementBelow.closest(".news-item");

        // Remove previous drag-over
        $(".news-item").removeClass("drag-over");

        // Add drag-over to valid target
        if (targetNews.length && !targetNews.is(draggedNews)) {
          targetNews.addClass("drag-over");
        }
      });

      // Mouse up handler
      $(document).on("mouseup.newsDrag", function (e) {
        // Clean up
        $(document).off("mousemove.newsDrag mouseup.newsDrag");
        clone.remove();

        if (draggedNews) {
          draggedNews.removeClass("dragging");

          // Find target element
          const elementBelow = $(
            document.elementFromPoint(e.clientX, e.clientY)
          );
          const targetNews = elementBelow.closest(".news-item");

          // Perform reorder if valid target
          if (targetNews.length && !targetNews.is(draggedNews)) {
            const allNews = $(".sidebar .news-item");
            const draggedIndex = allNews.index(draggedNews);
            const targetIndex = allNews.index(targetNews);

            if (draggedIndex < targetIndex) {
              targetNews.after(draggedNews);
            } else {
              targetNews.before(draggedNews);
            }

            // Reattach events after reordering
            attachNewsDragEvents(draggedNews);
          }

          // Remove drag-over class
          $(".news-item").removeClass("drag-over");
          draggedNews = null;
        }
      });
    });
  }

  // Attach drag events to news items
  $(".news-item").each(function () {
    attachNewsDragEvents($(this));
  });
});
