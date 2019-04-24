This folder contains the source code for the RSOLP annotator that was  once
running at the RSOLP projector page (http://kevinkarsch.com/?page_id=445).

There is little documentation inside the actual sources, but here is a high-
level look at what the folders contain:

annotator/ - Contains all frontend html5 code for the RSOLP annotator, e.g. what
    is shown here: https://vimeo.com/37792501. Most of the important code can be
    found in annotator/static, other code is for account creation/management/etc.


matlab/ -  Contains all of the backend matlab code for computing a 3D scene
    (output as a Blender scene file). The main function is inside
    createBlenderScene.m, which computes the scene based on an input text file
    specifying the annotated geometry, light sources, etc (see
    example/cornell_box/annotations.txt for an example). The function requires both
    Blender and LuxRender, and you need to specify their executable's path in both
    createBlenderScene.m and writeLuxrenderScene.m respectively. There is a mex file
    (mexProjectShafts.cpp) that has been precompiled for unix and OSX, but on
    Windows (and possibly newer versions of MATLAB), you'll need to re-mex this. The
    matlab/cleanedsrc_shadow2 is a copy of the code from the following paper:

    Single-Image Shadow Detection and Removal using Paired Regions Ruiqi Guo, Qieyun
    Dai and Derek Hoiem CVPR 2011. http://aqua.cs.uiuc.edu/site/projects/shadow.html

    Anyway, once the paths are linked up, you should be able to run (from the
    matlab/ folder) this matlab snippet to generate an example result:

    createBlenderScene('../example/cornell_box/cbox.png',
    '../example/cornell_box/annotations.txt', '../example/cornell_box');

    If everything worked, it the example/cornell_box folder should match the results
    in example/cornell_box_result.

    Also, if you'd like to compile this out as a matlab executable (e.g. for use on
    a server), use the createBlenderScene_compile.m script.


daemons/ - Contains simple (and probably very poorly written) bash scripts for
processing results via the web app. The way this worked previously on the server
was as follows: 1) A user was guided through the image upload / annotation
process via the web app code found in annotator/ 2) The annotator would simply
upload the user's image and write a text file into a certain directory on the
server (an example would be the two files that are found in example/cornell_box)
3) A bash script was running in the background constantly polling for new
annotation files. Once one was written to the disk, it would process it with via
the matlab code (e.g. createBlenderScene). The results were then zipped up and
emailed to the user. This is what daemons/rsolp_process_inbox was for, and the
other scripts were simply to make the process run in constantly and in the
background.

