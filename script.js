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
});
