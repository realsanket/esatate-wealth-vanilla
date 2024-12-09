const gulp = require('gulp');
const { execSync } = require('child_process');
const fs = require('fs');

// Install missing modules if necessary
function installModule(moduleName) {
    try {
        require.resolve(moduleName);
    } catch (e) {
        console.error(`Module '${moduleName}' is not installed. Installing...`);
        execSync(`npm install ${moduleName}`, { stdio: 'inherit' });
    }
}

installModule('gulp-clean-css');
installModule('gulp-concat');
installModule('gulp-uglify');
installModule('gulp-htmlmin');
installModule('gulp-watch');  // Add watch module for file watching
installModule('gulp-imagemin');  // Add imagemin module for image minification
installModule('browser-sync');  // Add browser-sync module for serving files

const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const watch = require('gulp-watch');  // Require gulp-watch module
const browserSync = require('browser-sync').create();  // Require browser-sync module

let imagemin;
(async () => {
    imagemin = (await import('gulp-imagemin')).default;
})();

// Minify CSS
gulp.task('minify-css', () => {
    return gulp.src('css/*.css')  // Updated to match the new CSS folder structure
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest('dist/css'));  // Output minified CSS to dist/css
});

// Minify JS
gulp.task('minify-js', () => {
    return gulp.src('js/*.js')  // Updated to match the new JS folder structure
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));  // Output minified JS to dist/js
});

// Minify HTML
gulp.task('minify-html', () => {
    return gulp.src('index.html')  // Minify the index.html
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist'));  // Output minified HTML to dist/
});

// Copy Assets (images, fonts) to dist/ folder
gulp.task('copy-assets', async () => {
    if (!imagemin) {
        imagemin = (await import('gulp-imagemin')).default;
    }

    // Check if the directories exist before copying
    if (fs.existsSync('assets/images')) {
        // Copy images to dist/assets/images
        gulp.src('assets/images/**/*')
            .pipe(imagemin())  // Optional: minify images
            .pipe(gulp.dest('dist/assets/images'));
    }

    if (fs.existsSync('assets/fonts')) {
        // Copy fonts to dist/assets/fonts
        gulp.src('assets/fonts/**/*')
            .pipe(gulp.dest('dist/assets/fonts'));
    }
});

// Watch Files for Changes
gulp.task('watch', () => {
    // Watch for changes in CSS files
    watch('css/*.css', gulp.series('minify-css'));

    // Watch for changes in JS files
    watch('js/*.js', gulp.series('minify-js'));

    // Watch for changes in HTML files
    watch('index.html', gulp.series('minify-html'));

    // Watch for changes in assets (images and fonts)
    watch('assets/images/**/*', gulp.series('copy-assets'));
    watch('assets/fonts/**/*', gulp.series('copy-assets'));
});

// Serve files and watch for changes
gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        port: 3000  // Specify the port you want to use
    });

    gulp.watch('css/*.css', gulp.series('minify-css')).on('change', browserSync.reload);
    gulp.watch('js/*.js', gulp.series('minify-js')).on('change', browserSync.reload);
    gulp.watch('index.html', gulp.series('minify-html')).on('change', browserSync.reload);
    gulp.watch('assets/images/**/*', gulp.series('copy-assets')).on('change', browserSync.reload);
    gulp.watch('assets/fonts/**/*', gulp.series('copy-assets')).on('change', browserSync.reload);
});

// Default task (Minify files, copy assets, watch for changes, and serve)
gulp.task('default', gulp.parallel('minify-css', 'minify-js', 'minify-html', 'copy-assets', 'watch', 'serve'));
