<?php

namespace Deployer;

require 'recipe/symfony3.php';

use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\Yaml\Yaml;

/**
 * @param string $file
 * @return void
 * @throws \RuntimeException
 */
function configuration($file)
{
    $config = Yaml::parse(file_get_contents($file));
    if (!is_array($config)) {
        throw new \RuntimeException('Error in parsing ' . $file . ' file.');
    }
    foreach ($config as $key => $value) {
        set($key, $value);
    }
}

inventory('deploy/servers.yml');
configuration('deploy/config.yml');

task('deploy:get-env-vars', function () {
    $dotenv = new Dotenv();
    if (!test('[ -f {{deploy_path}}/.env ]')) {
        writeln('<error>There is not .env file in {{deploy_path}}</error>');
        throw new \RuntimeException();
    }

    $environment = $dotenv->parse(run('cat {{deploy_path}}/.env'));
    $dotenv->populate($environment);
    set('env', $environment);
});

task('deploy:set-env-vars', function () {
    $environment = get('env');

    // Write .env to the current release
    reset($environment);
    $first = key($environment);
    foreach ($environment as $key => $value) {
        run('echo "' . $key . '=' . $value . '" ' . (($first === $key) ? '>' : '>>') . ' {{release_path}}/.env');
    }
    foreach ($environment as $key => $value) {
        run('echo "SetEnv ' . $key . ' ' . $value . '" ' . (($first === $key) ? '>' : '>>') . ' {{release_path}}/apache.conf');
    }
});

task('build', function () {
    writeln('<info>Create build dir...</info>');
    run('mkdir -p build build/vendor build/node_modules && mv build temp');
    run('rm -Rf build.tar.gz && mkdir -p build');
    run('mv temp/vendor build/vendor');
    run('mv temp/node_modules build/node_modules');
    run('rm -Rf temp');
    run('cp -R bin config src templates tests translations .env.dist composer.json composer.lock contributors.txt phpunit.xml.dist symfony.lock build/');
    run('cp -R assets .babelrc package.json webpack.config.babel.js yarn.lock build/');
    run('mkdir -p build/public && cp public/index.php public/.htaccess build/public/');
    run('sed -i \'s/.*APP_BUILD_DATE.*/define(\x27APP_BUILD_DATE\x27, \x27' . date('Y-m-d H:i:s') . '\x27);/\' build/public/index.php');

    writeln('<info>Install composer packages...</info>');
    run('cd ./build && composer install --verbose --prefer-dist --no-progress --no-interaction --optimize-autoloader --no-scripts');
    writeln('<info>Install yarn packages...</info>');
    run('cd ./build && yarn');
    writeln('<info>Build assets...</info>');
    run('cd ./build && node_modules/.bin/encore production');
    writeln('<info>Clean build dir...</info>');
    run('cd ./build && rm -R assets node_modules .babelrc package.json webpack.config.babel.js yarn.lock');
    writeln('<info>Updating permissions...</info>');
    run('cd ./build && find . -type f -exec chmod 644 {} +');
    run('cd ./build && find . -type d -exec chmod 755 {} +');
    writeln('<info>Creating archive...</info>');
    run('cd ./build && tar -zcvf ../build.tar.gz .');
    writeln('<info>Build finished...</info>');
})->local()->desc('Build project');

task('upload', function () {
    writeln('<info>Uploading archive...</info>');
    upload(__DIR__ . '/build.tar.gz', '{{release_path}}');
    writeln('<info>Extracting archive...</info>');
    run('tar -xvf {{release_path}}/build.tar.gz -C {{release_path}}');
    writeln('<info>Removing archive...</info>');
    run('rm -f {{release_path}}/build.tar.gz');
})->desc('Upload project');

task('release', [
    'deploy:info',
    'deploy:prepare',
    'deploy:lock',
    'deploy:get-env-vars',
    'deploy:release',
    'upload',
    'deploy:set-env-vars',
    'deploy:clear_paths',
    'deploy:create_cache_dir',
    'deploy:shared',
    'deploy:cache:clear',
    'deploy:cache:warmup',
    'deploy:writable',
    'database:migrate',
    'deploy:symlink',
    'deploy:unlock',
    'cleanup',
    'success'
]);

task('deploy', [
    'build',
    'release',
])->desc('Deploy your project');