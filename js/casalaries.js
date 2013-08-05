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
						(function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';
							if(!d.getElementById(id)){js=d.createElement(s);
								js.id=id;
								js.src=p+'://platform.twitter.com/widgets.js';
								fjs.parentNode.insertBefore(js,fjs);
							}
						})(document, 'script', 'twitter-wjs');
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

		var meetingPage = function(data) {
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
					var participants = (typeof data.participants !== 'undefined') ? data.participants.split(',') : [ ];
					var meetingTotal = 0;
					$.each(participants, function(index, participant) {
						participants[index] = positionData[participant];
						participants[index].id = participant;
						participants[index].hourly = Math.round((participants[index].total_pay / 2088) * data.hours, 2);
						meetingTotal += participants[index].hourly;
					});
					caSalaries.updateContent('department-template', { department : departmentName,
							meeting : true,
							hours: data.hours,
							meetingTotal : meetingTotal,
							participants : participants,
							plural : (data.hours > 1),
							year : year,
							meetingMessage : caSalaries.pithyMeetings[Math.floor(Math.random()*caSalaries.pithyMeetings.length)],
							positions : list });
			  	$('table.department tbody tr').on('click', function() {
			  		var participants = (typeof data.participants !== 'undefined') ? data.participants.split(',') : [ ];
			  		participants.push($(this).data('id'));
			  		$.router.go('/meeting/' + data.department + '/' + data.hours + '/' + participants.join(','));
			  	});
			  	$('table .remove').on('click', function(event) {
			  		var $button = $(this);
			  		event.preventDefault();
			  		var participants = (typeof data.participants !== 'undefined') ? data.participants.split(',') : [ ];
			  		$.each(participants, function(index, value) {
			  			if(value == $button.data('id')) {
			  				participants.splice(index, 1);
			  			}
			  		});
			  		if(participants.length) {
				  		$.router.go('/meeting/' + data.department + '/' + data.hours + '/' + participants.join(','));
				  	}
				  	else {
				  		$.router.go('/meeting/' + data.department + '/' + data.hours);
				  	}
			  	})
			  });
			});
		};

		$.router.add('/meeting/:department/:hours', meetingPage);

		$.router.add('/meeting/:department/:hours/:participants', meetingPage);

		if(location.hash.indexOf("#!/") === 0) {
			$(window).trigger("hashchange.router");
		}
	});

	var caSalaries = {

		pithyMeetings : [
			'about the state of the office refrigerator.',
			'where one person will speak and everyone else will be answering email.',
			'that will eventually devolve into a serious griping session.',
			'which has a carefully-crafted agenda that will be derailed five minutes in.',
			'that could have been replaced by a single well-written email.',
			'that will end with someone asking for "deliverables."',
			'in that conference room guarded by an overly-protective administrative assistant.',
			'which was scheduled three months ago and no one remembers why.',
			'where someome will hand out printouts of the file they just emailed everyone.',
			'where printed copies of the 50-slide powerpoint will be double-sided to "save paper."'
		],

		loading : function(stop) {
			this.updateContent('loading-template');
			var opts = {
			  lines: 10,
			  length: 20,
			  width: 10,
			  radius: 30,
			  corners: 1,
			  rotate: 0,
			  direction: 1,
			  color: '#000',
			  speed: 1,
			  trail: 27,
			  shadow: false,
			  hwaccel: false,
			  className: 'spinner',
			  zIndex: 2e9,
			  top: 'auto',
			  left: 'auto'
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