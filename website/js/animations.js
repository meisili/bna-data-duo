const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const year = parseInt(entry.target.dataset.year);
            setTimeout(() => {
                window.renderLineChart(year);
            }, 600);
        }
    });
}, { threshold: 0.6 });

document.querySelectorAll(".scrolly-step").forEach(step => {
    stepObserver.observe(step);
});