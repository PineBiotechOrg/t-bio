    /**
     * Module for adding "profile" entity. Every user has its profile. Before article (apostrophe-blog)
     * entities are inserted, they have the logged in user's profile id userprofile._id attached to
     * the article, as userProfileId field. This way, author of articles are always shown, even to
     * non-logged in users. In this file two migrations are included - add profile to existing
     * users and change from old "userId" that were in articles to new "userProfileId".
     * 
     * Run migration with node app.js apostrophe-migrations:migrate.
     * 
     * @author Alexandre Duarte (github.com/duartealexf)
     */

    const async = require('async');

    module.exports = {

        /**
         * Default stuff required by ApostropheCMS.
         */
        extend: 'apostrophe-pieces',
        name: 'profile',
        label: 'Profile',
        pluralLabel: 'Profiles',
        searchable: false,

        afterConstruct: function(self, callback) {

            /**
             * Ensure collection is set and add migrations to DB.
             */
            return async.series([
                self.ensureCollection,
                self.addUserProfileMigration,
                self.addBlogPageAuthorMigration,
            ], callback);
        },

        beforeConstruct: function(self, options) {

            options.addFields = [
                /**
                 * User of profile.
                 */
                {
                    name: '_user',
                    label: 'User',
                    type: 'joinByOne',
                    withType: 'apostrophe-user',
                    idField: 'userId',
                },

                /**
                 * Optional profile description.
                 */
                {
                    type: 'string',
                    textarea: true,
                    name: 'description',
                    label: 'Description',
                },

                /**
                 * Whether profile is published.
                 * Does not affect whether author is shown.
                 */
                {
                    type: 'boolean',
                    name: 'published',
                    label: 'Published',
                    def: true,
                },

                /**
                 * Profile thumbnail.
                 */
                {
                    name: 'thumbnail',
                    type: 'singleton',
                    widgetType: 'apostrophe-images',
                    label: 'Picture',
                    options: {
                        limit: 1,
                        aspectRatio: [100,100]
                    }
                }
            ].concat(options.addFields || []);
        },

        construct: function(self, options) {

            /**
             * Ensure collection variable is set.
             * 
             * @param {Function} callback 
             */
            self.ensureCollection = function(callback) {
                return self.apos.db.collection('aposDocs', function(err, collection) {
                    self.db = collection;
                    return callback(err);
                });
            };

            /**
             * Hook after inserting user. Actually watches on any doc insert,
             * so we need the 'if' statement below.
             *
             * @param {any} req Request.
             * @param {any} doc Doc being inserted.
             * @param {any} options Options from hook.
             * @param {any} callback
             */
            self.docAfterInsert = function(req, doc, options, callback) {

                /**
                 * No doc id, no change.
                 */
                if (!doc._id) {
                    return setImmediate(callback);
                }

                /**
                 * If it is an user, we add the profile.
                 */
                if (doc.type === 'apostrophe-user') {
                    return self.addUserProfile(req, doc, options, callback);
                }
                return setImmediate(callback);
            }

            /**
             * Hook before inserting article.
             * 
             * @param {any} req Request.
             * @param {any} doc Doc being inserted.
             * @param {any} options Options from hook.
             * @param {any} callback
             */
            self.docBeforeInsert = function(req, doc, options, callback) {

                /**
                 * No doc id, no change.
                 */
                if (!doc._id) {
                    return setImmediate(callback);
                }

                /**
                 * If it is a apostrophe-blog, we associate the profile
                 */
                if (doc.type === 'apostrophe-blog') {
                    return self.addProfileToArticle(req, doc, options, callback);
                }
                return setImmediate(callback);
            }

            /**
             * Method for creating user profile.
             * 
             * @param {any} req Request.
             * @param {any} user User having profile added.
             * @param {any} options Options from hook.
             * @param {any} callback
             */
            self.addUserProfile = function(req, user, options, callback) {

                /**
                 * Our profile entity.
                 */
                const profile = {
                    description: '',
                    published: true,
                    userId: user._id,
                    title: user.title,
                    slug: user.slug.replace(/^(user\-)?/, ''),
                    thumbnail: user.thumbnail
                }

                /**
                 * Insert async.
                 */
                return async.series({
                    save: function(callback) {
                        return self.insert(req, profile, {}, callback);
                    }
                });
            }

            /**
             * Method to add userProfileId to article.
             * 
             * @param {any} req Request.
             * @param {any} article Article having profile associated.
             * @param {any} options Options from hook.
             * @param {any} callback
             */
            self.addProfileToArticle = async function(req, article, options, callback) {

                /**
                 * Currently logged in user.
                 */
                const user = req.user;

                /**
                 * Extra check.
                 */
                if (!user) {
                    return setImmediate(callback);
                }

                /**
                 * This promise should resolve to the
                 * currently logged in user's profile id.
                 */
                const profileId = await new Promise(resolve => {

                    // Get profile of logged in user.
                    self.db.find({ type: self.name, userId: user._id }, async function(err, cursor) {
                        if (err) {
                            resolve();
                        }

                        const profile = await cursor.next();

                        resolve(profile ? profile._id : undefined);
                    });
                });

                /**
                 * No profile, no association.
                 */
                if (!profileId) {
                    return setImmediate(callback);
                }

                /**
                 * Attach the userProfileId and callback (ApostropheCMS will save the entity).
                 */
                article.userProfileId = profileId;

                return setImmediate(callback);
            }

            /**
             * Method to add migration that adds profile to already existing users.
             * 
             * @param {Function} callback 
             */
            self.addUserProfileMigration = function(callback) {

                /**
                 * Add migration to DB. The callback function will be called
                 * when running ApostropheCMS's CLI 'migration' command.
                 */
                self.apos.migrations.add(self.__meta.name + '.addUserProfile', function(callback) {

                    /**
                     * The users that need migrating.
                     */
                    let usersToMigrate = [];

                    /**
                     * Run 'docs' and 'migrate' functions async.
                     */
                    return async.series([ docs, migrate ], callback);

                    /**
                     * Get the users that need migrating.
                     */
                    function docs(callback) {

                        /**
                         * Get all profiles.
                         */
                        return self.db.find({ type: self.name }, async function(err, profiles) {
                            if (err) {
                                return callback(err);
                            }

                            let userIds = [], profile;

                            /**
                             * Fill array of userIds from already existing profiles.
                             */
                            while (profile = await profiles.next()) {
                                userIds.push(profile.userId);
                            }

                            /**
                             * Get all users not in userIds (users that have no profile).
                             * These are the usersToMigrate.
                             */
                            self.db.find({ type: 'apostrophe-user', _id: { $nin: userIds } }, async function(err, users) {
                                if (err) {
                                    return callback(err);
                                }

                                while (user = await users.next()) {
                                    usersToMigrate.push(user);
                                }

                                return callback(null);
                            });
                        })
                    }

                    /**
                     * Run migration.
                     * 
                     * @param {Function} callback 
                     */
                    async function migrate(callback) {

                        /**
                         * Iterate on usersToMigrate and create a profile for each user.
                         */
                        for (let i = 0; i < usersToMigrate.length; i++) {
                            const user = usersToMigrate[i];

                            /**
                             * Our profile entity.
                             */
                            const profile = {
                                _id: self.apos.utils.generateId(),
                                description: '',
                                published: true,
                                userId: user._id,
                                title: user.title,
                                type: self.name,
                                createdAt: user.updatedAt,
                                slug: user.slug.replace(/^(user\-)?/, ''),
                                docPermissions: [],
                                thumbnail: user.thumbnail,
                            }

                            await new Promise(resolve => self.db.insert(profile, resolve));
                        }

                        return setImmediate(callback);
                    }
                }, {
                    safe: true
                });

                return setImmediate(callback);

            }


            /**
             * Migration to swap from userId to userProfileId to
             * already existing apostrophe-blog entities.
             */
            self.addBlogPageAuthorMigration = function(callback) {

                /**
                 * Add migration to DB. The callback function will be called
                 * when running ApostropheCMS's CLI 'migration' command.
                 */
                self.apos.migrations.add(self.__meta.name + '.addBlogPageAuthor', function(callback) {

                    /**
                     * Mapping of profile id by user id.
                     */
                    const profileMapByUserId = new Map();

                    /**
                     * Posts (apostrophe-blog entities) that need migrating.
                     */
                    const postsToMigrate = [];

                    /**
                     * Run 'posts', 'profiles' and 'migrate' functions async.
                     */
                    return async.series([ posts, profiles, migrate ], callback);

                    /**
                     * Get the posts that need migrating.
                     * 
                     * @param {Function} callback
                     */
                    function posts(callback) {

                        /**
                         * Get all posts having an userId set (not yet migrated ones).
                         */
                        return self.db.find({ type: 'apostrophe-blog', userId: { $exists: true }}, async function(err, blogPosts) {
                            if (err) {
                                return callback(err);
                            }

                            let post;

                            /**
                             * Add found posts to postsToMigrate.
                             */
                            while (post = await blogPosts.next()) {
                                postsToMigrate.push(post);
                            }

                            return callback(null);
                        });
                    }

                    /**
                    * Create the profiles mapping by user id.
                    * 
                    * @param {Function} callback
                    */
                    function profiles(callback) {

                        /**
                        * As this function is running async, we need to set immediate
                        * callback to not migrate if there are no posts to migrate.
                        */
                        if (!postsToMigrate.length) {
                            setImmediate(callback);
                        }

                        /**
                        * Get all profiles.
                        */
                        return self.db.find({ type: self.name }, async function(err, profiles) {
                            if (err) {
                                return callback(err);
                            }

                            let profile;

                            /**
                            * Build mapping.
                            */
                            while (profile = await profiles.next()) {
                                profileMapByUserId.set(profile.userId, profile);
                            }

                            return callback(null);
                        });
                    }

                    /**
                    * Run migration.
                    * 
                    * @param {Function} callback 
                    */
                    async function migrate(callback) {

                        let userId, profile, post;

                        for (let i = 0; i < postsToMigrate.length; i++) {

                            /**
                            * Get userId of post.
                            */
                            post = postsToMigrate[i];
                            userId = post.userId;

                            if (!userId) {
                                continue;
                            }

                            /**
                            * Get profile of user.
                            */
                            profile = profileMapByUserId.get(userId);

                            if (!profile) {
                                continue;
                            }

                            /**
                            * Swap from userId to userProfileId.
                            */
                            delete post.userId;
                            post.userProfileId = profile._id;

                            /**
                            * Replace the post to the new one having userProfileId.
                            */
                            await new Promise(resolve => self.db.replaceOne({ _id: post._id }, post, resolve));
                        }

                        return callback(null);
                    }
                }, {
                    safe: true
                });

                return setImmediate(callback);

            }
        }
    }