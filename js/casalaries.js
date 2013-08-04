(function($) {
	
	$(document).ready(function() {
		$('select').chosen();
		caSalaries.buildDepartmentList($('#department'));

		caSalaries.getData('years', function(data) {
			$.each(data, function(index, year) {
				var $option = $('<option>');
				$option.html(year)
							 .attr('value', year);
				$('#year').append($option);
				$('#year').trigger("chosen:updated");
			});
		});

		$('#search').submit(function(event) {
			event.preventDefault();
			$.router.go('/department/' + $('#year').val() + '/' + $('#department').val());
		});

		$.router.add('/department/:year/:department', function(data) {
		  caSalaries.loading();
		  caSalaries.getData('departments', function(departmentData) {
		  	var departmentName = departmentData[data.department];
		  	caSalaries.getData(data.year +'/' + data.department, function(positionData) {
			  	var list = [];
					for (var position in positionData) {
						positionData[position].id = position;
					  list.push(positionData[position]);
					}
					caSalaries.updateContent('department-template', { department : departmentName, year : data.year, positions : list });
			  	$('table.department tbody tr').on('click', function() {
			  		$.router.go('/department/' + data.year + '/' + data.department + '/' + $(this).data('id'));
			  	});
			  });
			});
		});

		$.router.add('/department/:year/:department/:id', function(data) {
			caSalaries.loading();
		  caSalaries.getData('departments', function(departmentData) {
				var departmentName = departmentData[data.department];
		  	caSalaries.getData(data.year +'/' + data.department, function(positionData) {
					caSalaries.getData(data.year + '/average_salaries', function(averageData) {
						caSalaries.updateContent('person-template', { department : departmentName,
								year : data.year,
								person : positionData[data.id],
								averages : averageData[positionData[data.id].job_title] });
					});
				});
			});
		});

		$.router.add('/meeting', function() {
			caSalaries.loading();
		  $('.navbar-nav .active').removeClass('active');
			$('.navbar-nav .meeting').addClass('active');
			caSalaries.updateContent('meeting-template');
			caSalaries.buildDepartmentList($('#department-meeting'));
			$('#meeting').on('submit', function() {
				$.router.go('/meeting/' + $('#department-meeting').val() + '/' + parseFloat($('#hours').val()));
			});
		});

		$.router.add('/meeting/:department/:hours', function(data) {
			caSalaries.loading();
		  caSalaries.getData('departments', function(departmentData) {
		  	var departmentName = departmentData[data.department];
		  	var year = (data.department.indexOf('csu-') === 0 || data.department.indexOf('uc-') === 0 ) ? 2011 : 2012;
		  	caSalaries.getData(year +'/' + data.department, function(positionData) {
			  	var list = [];
					for (var position in positionData) {
						positionData[position].id = position;
					  list.push(positionData[position]);
					}
					caSalaries.updateContent('department-template', { department : departmentName, meeting : true, hours: data.hours, year : year, positions : list });
			  	$('table.department tbody tr').on('click', function() {
			  		console.log('hi');
			  	});
			  });
			});
		});

		if(location.hash.indexOf("#!/") === 0) {
			$(window).trigger("hashchange.router");
		}
	});

	var caSalaries = {

		loading : function(stop) {
			this.updateContent('loading-template');
			var opts = {
			  lines: 10, // The number of lines to draw
			  length: 20, // The length of each line
			  width: 10, // The line thickness
			  radius: 30, // The radius of the inner circle
			  corners: 1, // Corner roundness (0..1)
			  rotate: 0, // The rotation offset
			  direction: 1, // 1: clockwise, -1: counterclockwise
			  color: '#000', // #rgb or #rrggbb
			  speed: 1, // Rounds per second
			  trail: 27, // Afterglow percentage
			  shadow: false, // Whether to render a shadow
			  hwaccel: false, // Whether to use hardware acceleration
			  className: 'spinner', // The CSS class to assign to the spinner
			  zIndex: 2e9, // The z-index (defaults to 2000000000)
			  top: 'auto', // Top position relative to parent in px
			  left: 'auto' // Left position relative to parent in px
			};
			var spinner = new Spinner(opts).spin($('#loading').get(0));
			if(stop) {
				spinner.stop();
			}
			else {
				$('#loading .spinner').css('top', ($(window).height() / 2) + 'px')
														  .css('left', ($(window).width() / 2) + 'px');
			}
		},

		updateContent : function(template, context) {
			template = Handlebars.compile($('#' + template).html());
			$('#content').html(template(context));
			this.makeStupid();
		},

		makeStupid : function() {
			$('table.stupid').stupidtable()
											 .bind('aftertablesort', this.sortTableArrow);
			$('table.stupid .first-sort').trigger('click');
			$('.table-filter :text').each(function() {
				$(this).quicksearch($(this).data('target'));
			});
		},

		sortTableArrow : function(event, data) {
			var th = $(this).find("th");
	    th.find(".arrow").remove();
	    var arrow = data.direction === "asc" ? "&uarr;" : "&darr;";
	    th.eq(data.column).append(' <span class="arrow">' + arrow +'</span>');
		},

		getData : function(path, callback) {
			$.ajax({ dataType : 'json',
							 url      : '/data/' + path +'.json',
							 success  : callback,
							 error    : function() {
	 			  		     caSalaries.updateContent('no-data-template');
	 			  		   }
							 });
		},

		buildDepartmentList : function($select) {
			if($select.hasClass('departments-loaded')) {
				return;
			}
			$select.addClass('departments-loaded');
			$select.chosen();
			caSalaries.getData('departments', function(data) {
				$.each(data, function(file, name) {
					var $option = $('<option>');
					$option.html(name)
								 .attr('value', file);
					$select.append($option);
					$select.trigger("chosen:updated");
				});
				$('select.department-select').each(function() {
					$(this).addClass('departments-loaded')
				});
			});
		}
	}

})(jQuery);