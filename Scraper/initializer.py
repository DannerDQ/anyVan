from os import system, path

abs_path_node = path.abspath('./scraper.js')
system(f"node {abs_path_node}")