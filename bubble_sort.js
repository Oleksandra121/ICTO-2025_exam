document.addEventListener("DOMContentLoaded", () => {
  const scene = document.querySelector("#balls");
  const timerDiv = document.getElementById("timer");
  const startBtn = document.getElementById("startBtn");
  const algoSelect = document.getElementById("algoSelect");

  // Глобальна змінна швидкості
  window.ANIMATION_DURATION = 600;

  let values = [7, 2, 9, 4, 1, 6, 8, 0, 3, 5];
  let spacing = 0.5;
  let spheres = [];

  function createBars() {
    scene.innerHTML = '';
    spheres = [];

    const offset = ((values.length - 1) * spacing) / 2;

    values.forEach((val, i) => {
      const bar = document.createElement("a-box");
      bar.setAttribute("color", "#39f");
      bar.setAttribute("width", 0.3);
      bar.setAttribute("depth", 0.3);
      bar.setAttribute("height", val * 0.3);

      // Скидання попередніх анімацій
      bar.removeAttribute("animation__move");
      bar.removeAttribute("animation__merge");

      const x = i * spacing - offset;
      const y = (val * 0.3) / 2;
      bar.setAttribute("position", `${x} ${y} 0`);

      const text = document.createElement("a-text");
      text.setAttribute("value", val);
      text.setAttribute("align", "center");
      text.setAttribute("color", "white");
      text.setAttribute("position", `0 ${(val * 0.3) / 2 + 0.2} 0`);
      text.setAttribute("scale", "1 1 1");
      bar.appendChild(text);

      scene.appendChild(bar);
      spheres.push({ val, el: bar });
    });
  }

  function updatePositions() {
    const offset = ((spheres.length - 1) * spacing) / 2;
    spheres.forEach((s, i) => {
      const x = i * spacing - offset;
      const y = (s.val * 0.3) / 2;

      s.el.removeAttribute("animation__move");
      s.el.removeAttribute("animation__merge");

      s.el.setAttribute("position", `${x} ${y} 0`);
    });
  }

  function animateSwap(i, j) {
    return new Promise((resolve) => {
      const el1 = spheres[i].el;
      const el2 = spheres[j].el;
      const pos1 = el1.getAttribute("position");
      const pos2 = el2.getAttribute("position");

      // Підсвічування жовтим під час обміну
      el1.setAttribute("color", "#FFD700");
      el2.setAttribute("color", "#FFD700");

      el1.setAttribute("animation__move", {
        property: "position",
        to: `${pos2.x} ${pos1.y} ${pos1.z}`,
        dur: window.ANIMATION_DURATION,
      });
      el2.setAttribute("animation__move", {
        property: "position",
        to: `${pos1.x} ${pos2.y} ${pos2.z}`,
        dur: window.ANIMATION_DURATION,
      });

      setTimeout(() => {
        const temp = spheres[i];
        spheres[i] = spheres[j];
        spheres[j] = temp;

        updatePositions();

        // Повернення кольору до синього після анімації
        el1.setAttribute("color", "#39f");
        el2.setAttribute("color", "#39f");

        resolve();
      }, window.ANIMATION_DURATION + 100);
    });
  }

  async function bubbleSort() {
    let len = spheres.length;
    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len - 1 - i; j++) {
        if (spheres[j].val > spheres[j + 1].val) {
          await animateSwap(j, j + 1);
        }
      }
    }
    updatePositions();
  }

  async function quickSort(arr = spheres, left = 0, right = arr.length - 1) {
    if (left >= right) return;
    const pivot = arr[right].val;
    let i = left;
    for (let j = left; j < right; j++) {
      if (arr[j].val < pivot) {
        await animateSwap(i, j);
        i++;
      }
    }
    await animateSwap(i, right);
    await quickSort(arr, left, i - 1);
    await quickSort(arr, i + 1, right);
  }

  async function quickSortWithUpdate() {
    await quickSort(spheres, 0, spheres.length - 1);
    updatePositions();
  }

  async function mergeSort(start = 0, end = spheres.length - 1) {
    if (start >= end) return;
    const mid = Math.floor((start + end) / 2);
    await mergeSort(start, mid);
    await mergeSort(mid + 1, end);

    const merged = [];
    let i = start, j = mid + 1;
    while (i <= mid && j <= end) {
      if (spheres[i].val < spheres[j].val) {
        merged.push(spheres[i++]);
      } else {
        merged.push(spheres[j++]);
      }
    }
    while (i <= mid) merged.push(spheres[i++]);
    while (j <= end) merged.push(spheres[j++]);

    const offset = ((spheres.length - 1) * spacing) / 2;

    for (let k = start; k <= end; k++) {
      spheres[k] = merged[k - start];

      // Підсвічуємо жовтим перед анімацією
      spheres[k].el.setAttribute("color", "#FFD700");

      spheres[k].el.setAttribute("animation__merge", {
        property: "position",
        to: `${k * spacing - offset} ${(spheres[k].val * 0.3) / 2} 0`,
        dur: window.ANIMATION_DURATION,
      });

      await new Promise(r => setTimeout(r, window.ANIMATION_DURATION / 2));

      // Повертаємо колір назад після анімації
      spheres[k].el.setAttribute("color", "#39f");
    }
  }

  const times = {
    bubble: 0,
    quick: 0,
    merge: 0,
  };

  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Bubble Sort", "Quick Sort", "Merge Sort"],
      datasets: [{
        label: "Час сортування (мс)",
        data: [0, 0, 0],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
      }]
    },
    options: {
      responsive: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "white" }
        },
        x: {
          ticks: { color: "white" }
        }
      },
      plugins: {
        legend: { labels: { color: "white" } }
      }
    }
  });

  startBtn.addEventListener("click", async () => {
    const algo = algoSelect.value;
    createBars();
    timerDiv.innerText = "Час: 0 мс";
    startBtn.disabled = true;
    startBtn.innerText = "Сортування...";

    const startTime = performance.now();

    if (algo === "bubble") {
      await bubbleSort();
    } else if (algo === "quick") {
      await quickSortWithUpdate();
    } else if (algo === "merge") {
      await mergeSort();
      updatePositions();
    }

    const endTime = performance.now();
    const elapsed = Math.round(endTime - startTime);
    timerDiv.innerText = `Час: ${elapsed} мс`;

    times[algo] = elapsed;
    chart.data.datasets[0].data = [
      times.bubble,
      times.quick,
      times.merge
    ];
    chart.update();

    spheres.forEach(s => s.el.setAttribute("color", "#4CAF50"));

    startBtn.disabled = false;
    startBtn.innerText = "▶ Почати сортування";
  });

  createBars();
});