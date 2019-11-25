//= require ./all_nosearch
//= require ./app/_search

var app;

jQuery( window ).on( 'load', function() {
    new ClipboardJS( '.button__copy' );

    Vue.directive( 'sortable', {
        // When the bound element is inserted into the DOM...
        inserted: function ( el, binding ) {
            Sortable.create( el, binding.value || {} );
        }
    });

    app = new Vue(
        {
            el: '#builder-app',

            data: {
                blocks: [],
                code: '',
                code_cache: []
            },

            created: function() {
                this.orderedItems = _.orderBy(this.items, 'order')
            },

            methods: {
                add_block: function( event ) {
                    var vm      = this;
                    var value   = jQuery( event.target ).val();
                    var label   = jQuery( event.target ).find( 'option:selected' ).text();

                    if ( ( value ) && ( label ) && ( value.length ) && ( label.length ) ) {
                        vm.$data.blocks.push(
                            {
                                id: Math.random() * 100,
                                text: label,
                                template: value,
                                order: ( this.$data.blocks.length + 1 )
                            }
                        );

                        jQuery( event.target ).val( '' );

                        if ( !vm.$data.code_cache[ value ] ) {
                            jQuery.get( 'fragments/' + value + '.mjml',
                                        function( data ) {
                                            vm.$data.code_cache[ value ]  = data;

                                            vm.generate_code();
                                        },
                                        'html' );
                        } else {
                            vm.generate_code();
                        }
                    }
                },

                delete_block: function( event ) {
                    if ( confirm( 'Are you sure you want to delete this block?\n\nPress [OK] to confirm, or [CANCEL] to stop.' ) ) {
                        var id_block  = jQuery( event.target ).data( 'id' );

                        if ( id_block ) {
                            if ( this.$data.blocks.length === 1 ) {
                                this.$data.blocks   = [];
                            } else {
                                for ( var counter = 0; counter < this.$data.blocks.length; counter++ ) {
                                    if ( this.$data.blocks[ counter ].id.toString() === id_block.toString() ) {
                                        this.$data.blocks.splice( counter, 1 );
                                    }
                                }
                            }
                        }
                    }
                },

                generate_code: function() {
                    if ( this.$data.blocks.length ) {
                        this.$data.code     = [];

                        var ordered_blocks  = _.orderBy( this.$data.blocks, 'order' );

                        for ( var counter = 0; counter < ordered_blocks.length; counter++ ) {
                            if ( this.$data.code_cache[ ordered_blocks[ counter ].template ] ) {
                                this.$data.code     += this.$data.code_cache[ ordered_blocks[ counter ].template ];
                            }
                        }
                    }
                },

                copy_code: function() {
                    jQuery( app.$refs.copy ).addClass( 'copied' );

                    setTimeout( function() { jQuery( app.$refs.copy ).removeClass( 'copied' ); }, 2000 );
                },

                rearrange: function( event ) {
                    var vm = this;
                    var els = vm.$refs.blocks.children;

                    for ( var i = 0; i < els.length; i++ ) {
                        var id = els[ i ].getAttribute( '_id' );

                        vm.blocks.map(
                            function( item ) {
                                if ( item.id == id ) {
                                    item.order = i + 1
                                }
                            }
                        );
                    }

                    this.generate_code();
                }
            }
        }
    );
} );