This repo contains code associated with the paper:

Kevin Karsch, Varsha Hedau, David A Forsyth, Derek Hoiem. "Rendering synthetic objects into legacy photographs." SIGGRAPH Asia, 2011

#### Update: The server that was once running the RSOLP Annotator at UIUC has been decommissioned, and with no one there to support it, the web app will be offline until further notice.

I’m posting the (mostly undocumented) source here in case anyone adventurous enough wants to play with it or even get the web app up and running again. My goal is to eventually re-host the app somewhere else. In the mean time, I’d love to hear about any progress you make with it. However, I won’t be able to provide much if any support for the code in the near future.


## RSOLP Annotator

The RSOLP Annotator is a web interface that provides a basic implementation of the method detailed in the Rendering Synthetic Objects into Legacy Photographs (RSOLP) paper. This software allows you to upload a picture and semi-automatically create a rough 3D model of scene. The method is best suited for photographs of rooms and other man-made scenes, but may work in other cases as well. Through simple interactions, the interface allows an image to be annotated quickly and then sent to our server for processing. Once the 3D scene has been computed, you will receive an email containing a link to download your reconstructed scene. For references and examples, please refer to the Help tab within the Annotator’s interface. This software is not for commercial use.

If you use this software in your research, please cite the following paper above.


## RSOLP Compositor

#### Disclaimer: This code hasn't been touched (or compiled) since 2012, and certainly contains a lot of embarrassing code. Use/attempt to compile at your own risk.

This program can be used in conjunction with the RSOLP Annotator to insert synthetic objects into images. Together, these pieces of software provide a basic implementation of the method detailed in the Rendering Synthetic Objects into Legacy Photographs paper.

This program is for compositing together a set of images based on the differential rendering technique. Given four images, denoted background (b), render (r), empty (e), and mask (m), this software composites the images together according to equation:

composite = mγ ◦ r + (1-mγ) ◦ b + α (1-mγ) ◦ (r-e),

where γ and α are user-controlled parameters (usually left as γ=α=1).

Typically, b is the original image that an object is to be inserted into, e is the synethic, 3D rendering of a reconstructed version of the scene depicted in b, r is the same scene used to generate e but with synthetic models/objects inserted, and m is a scalar image defining which parts of the rendered image r should be composited into the background image b. In general, m should have white pixels in regions that inserted objects occupy, gray pixels on object boundaries, and black pixels everywhere else.

Put simply, the compositing equation takes pixels from the rendered image and “pastes” them onto the background image (as defined by the mask). The final term in the equation also adds any light interplay between inserted objects and the scene to the final composite, such as shadows and interreflections.

#### Creating the empty, render, and mask images
If you are using Blender and LuxRender (and the Blender+LuxRender exporter, LuxBlend25), this software can also be used to help generate the empty, render, and mask images. We have tested these instructions using Blender 2.58a and LuxRender 0.8, although other versions may also work. All scenes created using the RSOLP Annotator should be compatible with the following workflow (assuming Blender, LuxRender, and LuxBlend are installed):

1. Important: Currently, you must also have PyLux installed and enabled, which allows for LuxRendering within Blender. For (most) recent installations, PyLux is installed with LuxBlend and LuxRender, and all you need to do is enable PyLux within Blender. To enable Pylux:
Navigate to user preferences (File->User preferences)
Within the “Addons” tab, find the plugin called “Render: LuxRender” (only click once, this may take a few seconds)
Save the user preferences (File->Save user settings)
For more details, or if you encounter any issues, please refer to the LuxBlend help page.

1. Create a 3D scene model from a given background image (this can be done easily using the RSOLP Annotator).

1. Insert objects into the scene. In this example, say we insert objects named Object1 and Object2. Then, save and close the .blend file.

1. In the software interface, navigate to File->Write render files. This will open up a new window.

1. Choose/enter your blender executable (or app bundle if using MacOS X) under the “Blender binary/exe/app:” heading

1. Choose/enter the .blend file that you created under the “Blend file:” heading.

1. Enter the name of all objects that you inserted into the empty scene. The list should be comma separated. In our example, we inserted Object1 and Object2, so we would type “Object1, Object2” (without quotes) under the “Inserted object names:” heading.

1. Press the Write files button.

1. Assuming the blend file is saved as BLEND_DIR/project.blend, this should generate project.Scene.00001.lxs, project.Scene.00002.lxs, and mask.png inside of BLEND_DIR. You can then render the *.lxs files using LuxRender. The output rendered images, project.Scene.00001.png and project.Scene.00002.png, correspond to the “render” and “empty” images respectively.

#### Examples
Bundled with each of the above binary/source downloads is a sample blender scene created with the RSOLP Annotator (scene_example/) and a sample set of compositing images (composite_example/). Example 1 demonstrates how to composite the images in the composite_example directory. Example 2 gives a tutorial on extracting the render files from the sample scene.

*Example 1: compositing*

1. Run the Compositor executable.

1. Navigative to File->Open all. Choose the composite_example directory that came with the software.

1. All four images will be loaded, and the Compositor window will show the composite.
Note: this option only works when the given directory contains images named {background,render,empty,mask}.png.
    - Alternatively, you can use the browse icons below each image label to load the corresponding images individually.

1. You can then adjust the α and γ sliders. A larger α will make the interreflected light stronger (or conversely, the shadows darker), and γ controls the sharpness of object boundaries in the mask image. Usually these can stay set to 1, but in some circumstances it may be convenient to tweak them.

1. Once you are happy with the image in view, save it using the File menu. You’ll notice that there is already a compositing result in the composite_example directory. Your output should look roughly like this (depending on how you set α and γ).


*Example 2: extracting compositing files from a .blend scene*

1. Run the Compositor executable.

1. Navigate to File->Write render files. Choose the scene_example directory that came with the software.

1. Under the “Blender binary/exe/app:” heading, locate your blender executable/app bundle using the file browser.

1. Under the “Blend file:” heading, locate the blend file in the scene_example directory (it is named scene_example.blend). In this file, three objects have already been inserted, named Monkey, Sphere, and Torus.

1. Under the “Inserted object names:” heading, type “Monkey, Sphere, Torus” (without quotes). In general, these are the names of each object that you inserted into the Blender scene and wish to composite into the original (background) photo.

1. Press the Write files button.

1. This will produce the following files in the scene_example directory:
scene_example.Scene.00001.lxs
scene_example.Scene.00002.lxs
mask.png

1. Render the *.lxs files using LuxRender (this can take a while)

1. Upon completion, you will have the following images inside of the scene_example directory:

    ```
    Background – scene_example.png
    Render – scene_example.Scene.00001.png
    Empty – scene_example.Scene.00002.png
    Mask – mask.png
    ```

1. Refer to Example 1 for using this software to composite these images together.
