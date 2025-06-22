let sX = 50;
let sY = 300;
let mass = 10; // in kg
let r = 15;
let dragging = false;
let moving = false;
let timeScale = 0.5;
let realTime = 0.2;
let g = 9.81;

let friction = 1;

let vx = 0, vy = 0;
let frame = 0;

let kineticEnergyHistory = [];
let potentialEnergyHistory = [];
let mechanicalEnergyHistory = [];
let timeHistory = [];

const frictionSlider = document.getElementById('friction');
const frictionValue = document.getElementById('frictionValue');
const massSlider = document.getElementById('mass');
const massValue = document.getElementById('massValue');

const ctx = document.getElementById('energyChart').getContext('2d');
const energyChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Kinetic Energy',
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                data: [],
                fill: true,
            },
            {
                label: 'Potential Energy',
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.2)',
                data: [],
                fill: true,
            },
            {
                label: 'Mechanical Energy',
                borderColor: 'green',
                backgroundColor: 'rgba(0, 255, 0, 0.2)',
                data: [],
                fill: true,
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: {
                    display: true,
                    text: 'Time (s)',
                    color: 'white'
                },
                ticks: {
                    color: 'white' // Change tick label color
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.5)' // Change grid color
                }
            },
            y: {
                title: {
                    display: true,
                    color: 'white',
                    text: 'Energy (J)'
                },
                ticks: {
                    color: 'white' // Change tick label color
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.5)' // Change grid color
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'white' // Change legend text color to white
                }
            }
        }
    }
});

function setup() {
    let canvas = createCanvas(400, 400);
    canvas.parent('canvasContainer');
}


frictionSlider.addEventListener('input', function() {
    frictionValue.textContent = "Friction: " + this.value + "%";
    friction = (100 - this.value) / 100;
});
massSlider.addEventListener('input', function() {
    massValue.textContent = "Mass: " + this.value + "kg";
    mass = parseFloat(this.value);
});

function draw() {
    background(23, 23, 55);
    noStroke();
    fill(255);

    
    // Update energies and draw the ball
    if (moving) {
        // Handle boundaries
        if (sY > height || sY < 0) {
            if (sY > height) {
                sY = height;
            }
            
            if (sY < 0) {
                sY = 0;
            }
            
            vy *= -friction;
            vx *= friction + ((1-friction) / 1.5);
        }
        if (sX > width || sX < 0) {
            if (sX > width) {
                sX = width;
            }
            
            if (sX < 0) {
                sX = 0;
            }
            
            vx *= -friction;
        }
        
        // Update velocities and positions
        vy += g * timeScale * realTime;
        sX += vx * timeScale * realTime;
        sY += vy * timeScale * realTime;

        // Calculate energies
        let rv = sqrt(vx * vx + vy * vy);
        let ke = 0.5 * mass * rv * rv;
        let pe = mass * g * (height - sY);

        if (ke < 0) {
            ke = 0;
        }
        if (pe < 0) {
            pe = 0;
        }

        let me = pe + ke;


        // Store energy values for graphing
        frame += 1;
        if (frame % 20 == 0) {
            // Limit the length of the energy history arrays
            if (kineticEnergyHistory.length > 100) {
                kineticEnergyHistory.shift(); 
                potentialEnergyHistory.shift(); 
                mechanicalEnergyHistory.shift();
                timeHistory.shift(); 
            }

            if (ke >= 0 && pe >= 0 && me >= 0) {
                kineticEnergyHistory.push(ke);
                potentialEnergyHistory.push(pe);
                mechanicalEnergyHistory.push(me);
                timeHistory.push(frame * realTime); // Increment time
                updateChart();
            }
            console.log(kineticEnergyHistory.length);
        }
       
        text(`Kinetic Energy ${ke.toFixed(2)}J`, 10, 20);
        text(`Potential Energy ${pe.toFixed(2)}J`, 10, 40);
        text(`Mechanical Energy ${(me).toFixed(2)}J`, 10, 60);
        // Update the chart

        // Draw the ball
    }
    circle(sX, sY, r);
    
    // Handle dragging
    if (dragging) {
        line(mouseX, mouseY, sX, sY);
        
        let dx = sX - mouseX;
        let dy = sY - mouseY;
        let hyp = dist(mouseX, mouseY, sX, sY);
        
        let angle = atan2(dy, dx);
        vx = cos(angle) * hyp;
        vy = sin(angle) * hyp;

        let ix = sX;
        let iy = sY;
        let iv = vy;
        while (ix < width && iy < height) {
        iv += 9.81 * timeScale * realTime;
        ix += vx * timeScale * realTime;
        iy += iv * timeScale * realTime;
        
        circle(ix, iy, r/2);
        }
    }
}

function updateChart() {
    // Update the chart with the latest energy values
    energyChart.data.labels = timeHistory;
    energyChart.data.datasets[0].data = kineticEnergyHistory;
    energyChart.data.datasets[1].data = potentialEnergyHistory;
    energyChart.data.datasets[2].data = mechanicalEnergyHistory;
    
    energyChart.update();
}

function mousePressed() {
    if (!dragging && !moving) {
        let d = dist(mouseX, mouseY, sX, sY);
        console.log(d);
        if (d < r * 1.5) {
            dragging = true;
        }
    }
}

function mouseReleased() {
    if (dragging) {
        dragging = false;
        moving = true;
    }
}
