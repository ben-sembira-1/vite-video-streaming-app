import numpy as np
import pyvista as pv
import time
import json

# Function to read configuration from JSON file
def read_config(filename):
    with open(filename, "r") as f:
        return json.load(f)

# Generate random map data
def generate_map_data(shape=(100, 100), scale=10):
    x = np.linspace(0, shape[0], shape[0])
    y = np.linspace(0, shape[1], shape[1])
    xx, yy = np.meshgrid(x, y)
    z = np.random.rand(*xx.shape) * scale
    return xx, yy, z

# Simulate drone path
def simulate_drone_path(xx, yy, z, waypoints):
    path = np.zeros((len(waypoints), 3))
    for i, (x, y) in enumerate(waypoints):
        z_interp = np.interp(x, xx[:, 0], z[:, 0])
        path[i] = [x, y, z_interp]
    return path

# Generate random waypoints
def generate_waypoints(map_shape, num_waypoints):
    waypoints = []
    for _ in range(num_waypoints):
        x = np.random.randint(0, map_shape[0])
        y = np.random.randint(0, map_shape[1])
        waypoints.append((x, y))
    return waypoints

# Calculate the distance between two points in 3D space
def calculate_distance(point1, point2):
    return np.linalg.norm(point1 - point2)

# Create map visualization
def visualize_map(xx, yy, z, path, update_callback, distance_threshold):
    plotter = pv.Plotter()
    grid = pv.StructuredGrid(xx, yy, z)
    plotter.add_mesh(grid, cmap="terrain")

    # Create a point for the drone
    drone_point = pv.PolyData(path[0].reshape(1, -1))
    plotter.add_mesh(drone_point, color="red", point_size=20, render_points_as_spheres=True)

    # Add a line for the path
    path_line = pv.Line(path[0], path[-1], resolution=len(path) - 1)
    plotter.add_mesh(path_line, color="red")

    # Set the initial camera view
    plotter.camera_position = 'xy'
    plotter.camera.zoom(1.5)

    plotter.show(interactive_update=True, auto_close=False)  # Keep the window open for updates

    close_points = []

    # Update function for the drone's position and camera
    for i in range(len(path)):
        # Update the drone's position
        drone_point.points[0] = path[i]

        # Update the camera position to follow the drone's nose
        focal_point = path[i]
        position = (focal_point[0] - 5, focal_point[1], focal_point[2] + 2)  # Camera positioned in front of the drone
        viewup = (0, 1, 0)  # Up direction for the camera
        plotter.camera_position = [position, focal_point, viewup]

        # Render the updated scene
        plotter.render()

        # Call the update callback
        update_callback(i)

        # Check if the drone is close to the surface
        distance_to_surface = calculate_distance(path[i], [path[i][0], path[i][1], z[int(path[i][0]), int(path[i][1])]])
        if distance_to_surface < distance_threshold:
            close_points.append((i, path[i], distance_to_surface))

        # Simulate real-time update delay
        time.sleep(0.1)

    plotter.show()  # Keep the window open

    # Print the report of close encounters
    if close_points:
        print("Close Encounters Report:")
        for idx, point, distance in close_points:
            print(f"At waypoint {idx} the drone was {distance:.2f} units away from the surface at position {point}.")

# Main execution
# Read configuration from JSON file
config = read_config("config.json")
distance_threshold = config["distance_threshold"]

# Generate map data
xx, yy, z = generate_map_data()

# Generate random waypoints
num_waypoints = 20
waypoints = generate_waypoints(xx.shape, num_waypoints)

# Simulate drone path
drone_path = simulate_drone_path(xx, yy, z, waypoints)

# Callback function to print the drone's position (can be customized)
def update_callback(i):
    print(f"Drone position: {drone_path[i]}")

# Visualize map with real-time drone path update and proximity check
visualize_map(xx, yy, z, path=drone_path, update_callback=update_callback, distance_threshold=distance_threshold)

