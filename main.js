(function () {
    'use strict';

    var app = angular.module('myApp', ['ng-admin']);

    app.controller('myCtrl', function() {});

    app.config(function(RestangularProvider, $httpProvider) {
        RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params, httpConfig) {
            headers = headers || {};
            headers['Prefer'] = 'return=representation';

            if (operation === 'getList') {
                headers['Range-Unit'] = what;
                headers['Range'] = ((params._page - 1) * params._perPage) + '-' + (params._page * params._perPage - 1);
                delete params._page;
                delete params._perPage;

                if (params._sortField) {
                    params.order = params._sortField + '.' + params._sortDir.toLowerCase();
                    delete params._sortField;
                    delete params._sortDir;
                }
            }
        });

        RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
            switch (operation) {
                case 'get':
                    return data[0];
                case 'getList':
                    response.totalCount = response.headers('Content-Range').split('/')[1];
                    break;
            }

            return data;
        });

        // @see https://github.com/mgonto/restangular/issues/603
        $httpProvider.interceptors.push(function() {
            return {
                request: function(config) {
                    var pattern = /\/(\d+)$/;

                    if (pattern.test(config.url)) {
                        config.params = config.params || {};
                        config.params['id'] = 'eq.' + pattern.exec(config.url)[1];
                        config.url = config.url.replace(pattern, '');
                    }

                    return config;
                },
            };
        });
    });

    app.config(function (NgAdminConfigurationProvider) {
        var nga = NgAdminConfigurationProvider;

        var app = nga
            .application('Ng-admin + PostgREST')
            .baseApiUrl('https://postgrest.herokuapp.com/');

        var speaker = nga.entity('speakers');
        var session = nga.entity('sessions');
        var sponsor = nga.entity('sponsors');

        app
            .addEntity(speaker)
            .addEntity(session)
            .addEntity(sponsor);

        // speaker views -------------------------------------------------------

        speaker.menuView()
            .icon('<span class="glyphicon glyphicon-user"></span>');

        speaker.dashboardView()
            .title('Last speakers')
            .fields([
                nga.field('id'),
                nga.field('name'),
                nga.field('twitter'),
                nga.field('featured').type('boolean'),
                nga.field('lineup_order').type('number'),
            ]);

        speaker.listView()
            .perPage(10)
            .fields([
                nga.field('id'),
                nga.field('name'),
                nga.field('twitter'),
                nga.field('featured').type('boolean'),
                nga.field('lineup_order').type('number'),
            ])
            .listActions(['edit', 'show']);

        speaker.showView()
            .fields([
                nga.field('id'),
                nga.field('name'),
                nga.field('twitter'),
                nga.field('avatar_url'),
                nga.field('bio').type('text'),
                nga.field('featured').type('boolean'),
                nga.field('lineup_order').type('number'),
            ]);

        speaker.creationView()
            .fields([
                nga.field('name'),
                nga.field('twitter'),
                nga.field('avatar_url'),
                nga.field('bio').type('text'),
                nga.field('featured').type('boolean'),
                nga.field('lineup_order').type('number'),
            ]);

        speaker.editionView()
            .fields(speaker.creationView().fields());

        // session views -------------------------------------------------------

        session.menuView()
            .icon('<span class="glyphicon glyphicon-calendar"></span>');

        session.dashboardView()
            .title('Last sessions')
            .fields([
                nga.field('id'),
                nga.field('speaker_id', 'reference')
                    .label('Speaker')
                    .targetEntity(speaker)
                    .targetField(nga.field('name')),
                nga.field('start_time'),
                nga.field('end_time'),
                nga.field('location'),
                nga.field('session_type'),
            ]);

        session.listView()
            .fields([
                nga.field('id'),
                nga.field('speaker_id', 'reference')
                    .label('Speaker')
                    .targetEntity(speaker)
                    .targetField(nga.field('name')),
                nga.field('start_time'),
                nga.field('end_time'),
                nga.field('location'),
                nga.field('session_type'),
            ])
            .filters([
                nga.field('speaker_id', 'reference')
                    .label('Speaker')
                    .targetEntity(speaker)
                    .targetField(nga.field('name')),
                nga.field('location'),
            ])
            .listActions(['edit', 'show']);

        session.showView()
            .fields([
                nga.field('id'),
                nga.field('speaker_id'),
                nga.field('start_time'),
                nga.field('end_time'),
                nga.field('location'),
                nga.field('session_type'),
            ]);

        session.creationView()
            .fields([
                nga.field('speaker_id', 'reference')
                    .targetEntity(speaker)
                    .targetField(nga.field('name')),
                nga.field('start_time'),
                nga.field('end_time'),
                nga.field('location'),
                nga.field('session_type'),
            ]);

        session.editionView()
            .fields(session.creationView().fields());

        // sponsor views -------------------------------------------------------

        sponsor.menuView()
            .icon('<span class="glyphicon glyphicon-gift"></span>');

        sponsor.dashboardView()
            .title('Last sponsors')
            .fields([
                nga.field('id'),
                nga.field('name'),
                nga.field('site_url'),
            ]);

        sponsor.listView()
            .fields([
                nga.field('id'),
                nga.field('name'),
            ])
            .listActions(['edit', 'show']);

        sponsor.showView()
            .fields([
                nga.field('id'),
                nga.field('name'),
                nga.field('site_url'),
                nga.field('logo_url'),
            ]);

        sponsor.creationView()
            .fields([
                nga.field('name'),
                nga.field('site_url'),
                nga.field('logo_url'),
            ]);

        sponsor.editionView()
            .fields(sponsor.creationView().fields());

        // ---------------------------------------------------------------------

        nga.configure(app);
    });
}());
