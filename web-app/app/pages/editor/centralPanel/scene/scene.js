
module.exports = Vue.component('app-curr-scene', {
    props: [],
    template: require('./scene.html'),
    data: function () {
        return {
            editData: require('providers/editData'),
            i18n: require('providers/i18n').getAll()
        }
    },
    components: {

    },
    methods: {

    }
});