// ── Line Chart ────────────────────────────────────────────
function renderLineChart(highlightYear) {
  const spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": ["New Legislation Requiring Fragrance Reporting Skyrockets Harmful Product Submissions"],
    "width": 700,
    "height": 350,
    "config": {
      "background": "transparent",
      "view": { "stroke": "transparent", "background": "transparent" },
      "axis": { "grid": false },
      "title": {
        "font": "Playfair Display",
        "fontSize": 18,
        "fontWeight": 600,
        "color": "#1a1a1a",
        "offset": 20
      }
    },
    "data": { "url": "charts/prodsbyyear.csv" },
    "layer": [
      {
        "mark": { "type": "rect", "color": "#2d4a3e", "opacity": 0.15 },
        "transform": [{"filter": `datum['Product Submitted Year'] == ${highlightYear}`}],
        "encoding": {
          "x": { "field": "Product Submitted Year", "type": "ordinal" }
        }
      },
      {
        "mark": { "type": "line", "color": "#2d4a3e" },
        "encoding": {
          "x": {
            "field": "Product Submitted Year",
            "type": "ordinal",
            "axis": { "labelAngle": 0, "ticks": false, "labelPadding": 10 }
          },
          "y": {
            "field": "count",
            "type": "quantitative",
            "axis": { "tickCount": 5 }
          },
          "tooltip": [
            { "field": "count", "type": "quantitative" }
          ]
        }
      }
    ]
  }
  vegaEmbed("#chart", spec, { "actions": false })
}

// Render with 2009 highlighted by default
renderLineChart(2009)
window.renderLineChart = renderLineChart

// ── Waffle Chart ──────────────────────────────────────────
function buildWaffle(data) {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const CELLS = 100;
    const colors = [
        "#2d4a3e", "#5c8a6f", "#8fb89a", "#b5804a", "#d4a853",
        "#7a9e7e", "#4a7c6f", "#c17f3e", "#9bc4a8", "#6b4c3b",
        "#e8c4a0", "#4a6741", "#b8956a", "#7fb3a8"
    ];

    const cells = [];
    data.forEach((d, i) => {
        const n = Math.round((d.count / total) * CELLS);
        for (let j = 0; j < n; j++) cells.push({ ...d, color: colors[i] });
    });

    while (cells.length < CELLS) cells.push(cells[cells.length - 1]);
    while (cells.length > CELLS) cells.pop();

    const grid = document.getElementById("waffle-chart");
    grid.style.cssText = "display:flex; flex-wrap:wrap; gap:4px; width:340px;";

    cells.forEach(cell => {
        const div = document.createElement("div");
        div.style.cssText = `width:28px; height:28px; border-radius:3px; background:${cell.color};`;
        div.title = `${cell.area}: ${cell.count.toLocaleString()} products`;
        grid.appendChild(div);
    });

    const legend = document.getElementById("waffle-legend");
    legend.style.cssText = "margin-top:0; flex:1; display:flex; flex-direction:column; justify-content:space-between;";
    data.forEach((d, i) => {
        const item = document.createElement("div");
        item.style.cssText = "display:flex; justify-content:space-between; align-items:center; gap:0.6rem; margin-bottom:0.5rem; font-size:0.82rem; color:#444; width:100%;";
        item.innerHTML = `
            <div style="width:12px; height:12px; border-radius:2px; background:${colors[i]}; flex-shrink:0;"></div>
            <span style="flex:1">${d.area}</span>
            <span style="color:#2d4a3e; font-weight:500;">${d.count.toLocaleString()}</span>
        `;
        legend.appendChild(item);
    });
}

fetch("charts/body_area.csv")
    .then(response => response.text())
    .then(csvText => {
        const rows = csvText.trim().split("\n").slice(1).map(row => {
            const [area, count] = row.split(",");
            return { area: area.trim(), count: parseInt(count) };
        });
        buildWaffle(rows);
    });

// ── Bubble Chart ──────────────────────────────────────────
const bubbleSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": ["Top 10 Most Reported Cosmetic Types"],
  "width": 700,
  "height": 400,
  "config": {
    "background": "transparent",
    "view": { "stroke": "transparent", "background": "transparent" },
    "axis": { "grid": false },
    "title": {
      "font": "Playfair Display",
      "fontSize": 18,
      "fontWeight": 600,
      "color": "#1a1a1a",
      "offset": 20
    }
  },
  "data": { "url": "charts/top_10_cats.csv" },
  "mark": { "type": "circle", "opacity": 0.85 },
  "encoding": {
    "x": {
      "field": "Product Category",
      "type": "nominal",
      "axis": { "title": null, "labelAngle": -30, "labelLimit": 150 }
    },
    "y": {
      "field": "product count",
      "type": "quantitative",
      "axis": { "title": "Number of Products", "tickCount": 5 }
    },
    "size": {
      "field": "product count",
      "type": "quantitative",
      "scale": { "range": [500, 8000] },
      "legend": null
    },
    "color": {
      "field": "Product Category",
      "type": "nominal",
      "scale": { "range": ["#2d4a3e","#3d6b58","#4e8a72","#5fa88c","#70c4a5","#b5804a","#8fa67a","#c9dfc2","#a3c4a8","#6b4c3b"] },
      "legend": null
    },
    "tooltip": [
      { "field": "Product Category", "type": "nominal", "title": "Category" },
      { "field": "product count", "type": "quantitative", "title": "Products Reported" }
    ]
  }
}

vegaEmbed("#bubble-chart", bubbleSpec, { "actions": false })

// ── Hazard by Year Chart ──────────────────────────────────
const hazardDescriptions = {
  "Carcinogenicity": "can cause cancer",
  "Fragrance Allergen": "can trigger allergic reactions from fragrance",
  "Reproductive Toxicity": "can harm reproductive health or fertility",
  "Developmental Toxicity": "can harm a baby's development during pregnancy",
  "Endocrine Toxicity": "can disrupt hormones",
  "Neurotoxicity": "can damage the nervous system or brain",
  "Genotoxicity": "can damage DNA",
  "Immunotoxicity": "can weaken the immune system",
  "Bioaccumulation": "builds up in the body over time",
  "Environmental Persistence": "stays in the environment for a long time",
  "Environmental Toxicity": "harmful to wildlife and ecosystems",
  "Ocular Toxicity": "can irritate or damage eyes",
  "Respiratory Toxicity": "can irritate or damage lungs and airways",
  "Dermatotoxicity": "can irritate or damage skin",
  "Hematotoxicity": "can damage blood cells",
  "Neurodevelopmental Toxicity": "can impair brain development in children",
  "Cardiovascular Toxicity": "can harm the heart or blood vessels",
  "Musculoskeletal Toxicity": "can damage muscles, bones, or joints",
  "Hepatotoxicity and Digestive System Toxicity": "can harm the liver or digestive system",
  "Nephrotoxicity and Other Toxicity Types": "can damage kidneys",
  "Other Toxicological Hazard Traits": "other known health hazards",
  "Hazard Trait Undefined": "hazard type not yet classified"
};

const hazardSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": 700,
  "height": 400,
  "config": {
    "background": "transparent",
    "view": { "stroke": "transparent", "background": "transparent" },
    "axis": { "grid": false },
    "title": {
      "font": "Playfair Display",
      "fontSize": 18,
      "fontWeight": 600,
      "color": "#1a1a1a",
      "offset": 20
    }
  },
  "data": { "url": "charts/hazardbyyear.csv" },
  "params": [{
    "name": "hazardSelect",
    "bind": {
        "input": "select",
        "options": [null,"Carcinogenicity","Fragrance Allergen","Reproductive Toxicity","Developmental Toxicity","Endocrine Toxicity","Neurotoxicity","Genotoxicity","Immunotoxicity","Bioaccumulation","Environmental Persistence","Environmental Toxicity","Ocular Toxicity","Respiratory Toxicity","Dermatotoxicity","Hematotoxicity","Neurodevelopmental Toxicity","Cardiovascular Toxicity","Musculoskeletal Toxicity","Hepatotoxicity and Digestive System Toxicity","Nephrotoxicity and Other Toxicity Types","Other Toxicological Hazard Traits","Hazard Trait Undefined"],
        "labels": ["All Hazard Types","Carcinogenicity","Fragrance Allergen","Reproductive Toxicity","Developmental Toxicity","Endocrine Toxicity","Neurotoxicity","Genotoxicity","Immunotoxicity","Bioaccumulation","Environmental Persistence","Environmental Toxicity","Ocular Toxicity","Respiratory Toxicity","Dermatotoxicity","Hematotoxicity","Neurodevelopmental Toxicity","Cardiovascular Toxicity","Musculoskeletal Toxicity","Hepatotoxicity and Digestive System Toxicity","Nephrotoxicity and Other Toxicity Types","Other Toxicological Hazard Traits","Hazard Trait Undefined"],
        "name": "Filter by Hazard Type: "
    }
    }],
    "transform": [{
        "filter": "hazardSelect == null || hazardSelect == '' || datum['Hazard Traits'] == hazardSelect"
    }],
    "mark": "bar",
    "encoding": {
    "x": {
        "field": "Product Submitted Year",
        "type": "ordinal",
        "axis": { "labelAngle": 0, "ticks": false, "labelPadding": 10, "title": "Year" }
    },
    "y": {
        "field": "count",
        "type": "quantitative",
        "axis": { "tickCount": 5, "title": "Products Reported" }
    },
    "color": {
        "field": "Hazard Traits",
        "type": "nominal",
        "scale": { "scheme": "tableau20" }
    },
    "tooltip": [
        { "field": "Hazard Traits", "type": "nominal", "title": "Hazard Type" },
        { "field": "Product Submitted Year", "type": "ordinal", "title": "Year" },
        { "field": "count", "type": "quantitative", "title": "Products" }
    ]
 }
};
vegaEmbed("#hazard-chart", hazardSpec, { "actions": false }).then(result => {
  result.view.addSignalListener("hazardSelect", (name, value) => {
    const subtitle = document.getElementById("hazard-subtitle");
    if (value && hazardDescriptions[value]) {
      subtitle.innerHTML = `<span>${value}</span>  |  <em>${hazardDescriptions[value]}</em>`;
      subtitle.style.display = "block";
    } else {
      subtitle.style.display = "none";
    }
  });
});