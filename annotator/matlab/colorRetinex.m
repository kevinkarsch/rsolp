function [refl, shading, refl_int] = colorRetinex(img, threshold_gray, threshold_color)
%COLORRETINEX decomposes an image into reflectance and shading such that
%refl*shading = img

    %If no parameters, use learned weights from Grosse '09 data
    if( nargin<2 )
        threshold_gray = 0.075; %1.0;
    end
    if( nargin<3 )
        threshold_color = 0.075;
    end
    
    max_h = 720; max_w = 960;    
    [orig_h, orig_w, d] = size(img);
    scale = min([max_h/orig_h, max_w/orig_w, 1]);
    img = imresize(img, scale, 'bilinear');

    img = im2double(img);
    [h,w,d] = size(img);
    N = w*h;
    
    %Get intensity and chromaticity gradients
    img(img<0.01) = 0.01;
    log_img = log(img);
    Gy_orig = [zeros(1,w,d); log_img(2:end,:,:)-log_img(1:end-1,:,:)];
    Gy_gray = repmat(mean(Gy_orig,3),[1,1,3]);
    Gy_color = Gy_orig - Gy_gray;
    Gx_orig = [zeros(h,1,d), log_img(:,2:end,:)-log_img(:,1:end-1,:)];
    Gx_gray = repmat(mean(Gx_orig,3),[1,1,3]);
    Gx_color = Gx_orig - Gx_gray;
    
    %Grayscale gradients
    gr_img = mean(img,3);
    gr_img(gr_img<0.01) = 0.01;
    log_gr_img = log(gr_img);
    Gy = [zeros(1,w,1); log_gr_img(2:end,:,:)-log_gr_img(1:end-1,:,:)];
    Gx = [zeros(h,1,1), log_gr_img(:,2:end,:)-log_gr_img(:,1:end-1,:)];
    
    %Color retinex gradient matching criteria
    ymatch = (sqrt(sum(Gy_color.^2,3)) > threshold_color) | ...
             (abs(Gy_gray(:,:,1)) > threshold_gray);
    xmatch = (sqrt(sum(Gx_color.^2,3)) > threshold_color) | ...
             (abs(Gx_gray(:,:,1)) > threshold_gray);
    Ry = Gy .* double(ymatch);
    Rx = Gx .* double(xmatch);
     
    %Compute image gradient operators
    top = -ones(N,1);
    top(h:h:end) = 0;
    GY = spdiags([top,ones(N,1)], [-1,0], N, N);
    left = -ones(N,1);
    GX = spdiags([left, ones(N,1)], [-h,0], N, N);
    
    %Weights (ignore first row/column)
    WY = ones(h,w);
    WY(1,:) = 0;
    WY = spdiags(WY(:),0,N,N);
    WX = ones(h,w);
    WX(:,1) = 0;
    WX = spdiags(WX(:),0,N,N);
    
    %Solve retinex system
    x = (GX'*WX*GX+GY'*WY*GY)\(Rx(:)'*WX*GX+Ry(:)'*WY*GY)';
    logrefl = reshape(x, [h,w]);
    
    %Output results
    refl = exp(logrefl);
    sortedrefl = sort(refl(:));
    normconst = sortedrefl( int32(numel(refl)*0.99) );
    refl_int = refl ./ normconst;
    shading = gr_img ./ refl_int;
    refl = img ./ repmat(shading,[1,1,3]);

    %Set back to original scale
    refl_int = imresize(refl_int, 1/scale, 'bilinear');
    shading = imresize(shading, 1/scale, 'bilinear');
    refl = imresize(refl, 1/scale, 'bilinear');
end
