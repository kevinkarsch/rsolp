function matte = main( img )
%MAIN Runs shadow matting on a given img, returns matte
    name = ['tmp_' timestamp];
    imwrite(im2double(img), ['data/original/' name '.png']);
    deshadow_driver_single({[name '.png']});
    runMatting({[name '.png']});
    matte = im2double(imread(['data/matting/' name '_soft.png']));
    delete('data/original/*', 'data/matting/*', 'data/binary/*', ...
           'data/cache/*', 'data/mask/*', 'data/unary/*');
end

