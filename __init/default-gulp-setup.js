/*!
 * gulp
 * $ npm install gulp-ruby-sass gulp-autoprefixer gulp-jshint gulp-strip-debug gulp-uglify gulp-rename gulp-replace gulp-concat gulp-notify gulp-minify-css gulp-plumber gulp-util gulp-base64 gulp-imagemin browser-sync --save-dev
 */

// Load plugins
var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var stripdebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var concat = require('gulp-concat');
var notify = require('gulp-notify');
var minifycss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var base64 = require('gulp-base64');
var imagemin = require('gulp-imagemin');
var browsersync = require('browser-sync');

// error function for plumber
var onError = function (err) {
  gutil.beep();
  console.log(err);
  this.emit('end');
};

// Browser definitions for autoprefixer
var AUTOPREFIXER_BROWSERS = [
  'last 3 versions',
  'ie >= 8',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

//build datestamp for cache busting
var getStamp = function() {
  var myDate = new Date();

  var myYear = myDate.getFullYear().toString();
  var myMonth = ('0' + (myDate.getMonth() + 1)).slice(-2);
  var myDay = ('0' + myDate.getDate()).slice(-2);
  var mySeconds = myDate.getSeconds().toString();

  var myFullDate = myYear + myMonth + myDay + mySeconds;

  return myFullDate;
};

// BrowserSync proxy
gulp.task('browser-sync', function() {
  browsersync({
    proxy: 'www.webstoemp.dev',
    port: 3000
  });
});

// BrowserSync reload all Browsers
gulp.task('browsersync-reload', function () {
    browsersync.reload();
});

// Optimize Images task
gulp.task('images', function() {
  return gulp.src('./public_html/assets/img/**/*.{gif,jpg,png}')
    .pipe(imagemin({
        progressive: true,
        interlaced: true,
        svgoPlugins: [ {removeViewBox:false}, {removeUselessStrokeAndFill:false} ]
    }))
    .pipe(gulp.dest('./public_html/assets/img/'));
});

// CSS task
gulp.task('css', function() {
  return gulp.src('./public_html/assets/scss/*.scss')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sass({ style: 'expanded', }))
    .pipe(gulp.dest('./public_html/assets/css/'))
    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(base64({ extensions:['svg'] }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('./public_html/assets/css/'))
    .pipe(browsersync.reload({ stream:true }))
    .pipe(notify({ message: 'Styles task complete' }));
});

// Lint JS task
gulp.task('jslint', function() {
  return gulp.src('./public_html/assets/js/modules/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(notify({ message: 'Lint task complete' }));
});

//Concatenate and Minify JS task
gulp.task('scripts', function() {
  return gulp.src('./public_html/assets/js/modules/*.js')
    .pipe(concat('webstoemp.js'))
    .pipe(gulp.dest('./public_html/assets/js/build'))
    .pipe(rename('webstoemp.min.js'))
    .pipe(stripdebug())
    .pipe(uglify())
    .pipe(gulp.dest('./public_html/assets/js/build'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// Cache busting task
gulp.task('cachebust', function() {
  return gulp.src('./craft/templates/_layouts/*.html')
    .pipe(replace(/screen.min.css\?([0-9]*)/g, 'screen.min.css?' + getStamp()))
    .pipe(replace(/print.min.css\?([0-9]*)/g, 'print.min.css?' + getStamp()))
    .pipe(replace(/webstoemp.min.js\?([0-9]*)/g, 'webstoemp.min.js?' + getStamp()))
    .pipe(gulp.dest('./craft/templates/_layouts/'))
    .pipe(notify({ message: 'CSS/JS Cachebust task complete' }));
});

// Start web server and watchers to recompile on file changes
gulp.task('watch', ['browser-sync'], function () {
  gulp.watch('./public_html/assets/scss/**/*', ['css']);
  gulp.watch('./public_html/assets/js/modules/**/*', ['jslint', 'scripts', 'browsersync-reload']);
  gulp.watch('./craft/templates/**/*', ['browsersync-reload']);
});

//tasks
gulp.task('default', ['css', 'jslint', 'scripts', 'cachebust'], notifySuccess);
gulp.task('images', ['img']);

// small desktop popup with result of a build
function notifySuccess(err) {
  notifier.notify({
    title: 'GULP BUILD ' + (err ? 'FAILED' : 'SUCCESS'),
    message: err ? 'at ' + err.message : '✔ ' + env
  });
}
