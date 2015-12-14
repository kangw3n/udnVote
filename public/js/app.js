$(function() {
  'use strict';

  var socket = io(); //socket;

  var electionCountArray;
  var countArray;
  var aheadArray;
  var winnerArray;
  var candidate ;
  var flag;

  var mapData = {
    chart: {
      renderTo: 'infochart',
      backgroundColor: '#F2F2F2',
      style: {
        fontFamily: '微軟正黑體, Microsoft JhengHei, LiHei Pro',
      },
    },
    title: {
      text: '',
    },
    credits: {
      enabled: false
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: 'bottom'
      }
    },
    tooltip: {
      useHTML: true,
      formatter: function() {
        var voteCount = this.point.voteValue;
        var aheadIndex = this.point.ahead;
        var winnerIndex = this.point.winner;
        var arrayLength = voteCount.length;
        var result = '<div class="map-tooltips_title">' + this.point.name + '</div>';

        for (var i = 0; i < arrayLength; i++) { //table inject
          if (aheadIndex[i] && !winnerIndex[i]) {
            result += '<div class="map-tooltips_elected map-tooltips_elected-color-' + flag[i] + '">' + (i + 1) + '. ' + candidate[i] + '<span class="thumb-tooltips thumb-tooltips-' + flag[i] + '"></span>: ' + voteCount[i].toLocaleString() + '<span class="thumb-tooltips"></span> 領先！！</div>';
          } else if (winnerIndex[i] && aheadIndex[i]) {
            console.log('obj');
            result += '<div class="map-tooltips_elected map-tooltips_elected-color-' + flag[i] + '">' + (i + 1) + '. ' + candidate[i] + '<span class="thumb-tooltips thumb-tooltips-' + flag[i] + '"></span>: ' + voteCount[i].toLocaleString() + '<span class="thumb-tooltips thumb-tooltips-winner"></span></div>';
          } else {
            result += '<div class="map-tooltips_elected">' + (i + 1) + '. ' + candidate[i] + '<span class="thumb-tooltips thumb-tooltips-' + flag[i] + '"></span>: ' + voteCount[i].toLocaleString() + '</div>';
          }
        }

        return result;
      },
    },
    legend: {
      enabled: true,
      align: 'right',
      layout: 'vertical',
      floating: true
    },
    series: [],
  };


  var pieData = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      style: {
        fontFamily: '微軟正黑體, Microsoft JhengHei, LiHei Pro',
      },
      type: 'pie',
      renderTo: 'pieData',
    },
    title: {
      text: '2016總統大選統計圖',
    },
    credits: {
      enabled: false
    },
    tooltip: {
      pointFormat: '{series.name}: <b>({point.y}) {point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          distance: -40,
          formatter: function() {
            return this.percentage.toFixed() + '%';
          }
        },
        showInLegend: true
      }
    },
    series: [{
      name: '得票數',
      colorByPoint: true,
      data: [],
    }]
  };

  var htmlInject = function(e) {
    var markupPresident = '';
    var checkedElected = function(boo) {
      if (!boo) {
        return '';
      } else {
        return '<span class="president-elected"></span>';
      }
    };

    var getTotal = e[0].voteCount + e[1].voteCount + e[2].voteCount;
    var percentage = [(e[0].voteCount / getTotal * 100).toFixed(2), (e[1].voteCount / getTotal * 100).toFixed(2), (e[2].voteCount / getTotal * 100).toFixed(2)];

    $.each(e, function(index, value) { // table inject
      markupPresident += '<tr class="actual-data"><td class="vote-no-col">' + value.partyNo + '</td><td class="table-flag"><span class="thumb thumb-' + value.partyName + '"></span>' + value.party + '</td><td>' + value.candidate + '</td><td>' + value.vice + '</td><td>' + value.voteCount.toLocaleString() + '</td><td>' + percentage[index] + '</td><td>' + checkedElected(value.elected) + '</td></tr>';

      pieData.series[0].data.push({ // pieData fill
        name: value.candidate + "<br>" + value.vice,
        y: value.voteCount,
        color: value.color,
      });

      if (index >= 2) return false;
    });

    //table2 inject
    $('#residentTotal').html(e[3].allVoter.toLocaleString());
    $('#voteTotal').html(e[3].voteCounter.toLocaleString());
    $('#validTotal').html(e[3].valid.toLocaleString());
    $('#invalidTotal').html(e[3].invalid.toLocaleString());
    $('#percentageVote').html(e[3].votePercent);

    $('.vote-result_table tbody').append(markupPresident);

  };

  var mapInject = function(e) {
    var templateSeries = function(name, electionData, color) {
      // console.log(name, electionData, color);
      mapData.series.push({
        data: electionData,
        mapData: Highcharts.maps['countries/tw/tw-all'],
        joinBy: 'hc-key',
        name: name,
        color: color,
        allAreas: false,
        allowPointSelect: true,
        states: {
          hover: {
            color: '#505050',
          }
        },
        dataLabels: {
          enabled: true,
          format: '{point.name}'
        },
      });
    };

    $.each(e, function(index, value) {
      // var data = value.electionData;
      var party = value.party;
      var color = value.color;
      var length = e[index].stateData.length;

      for (var i = 0; i < length; i++) {
        countArray[i].push(e[index].stateData[i].count);
        aheadArray[i].push(e[index].stateData[i].ahead);
        winnerArray[i].push(e[index].stateData[i].winner);

        if (e[index].stateData[i].ahead) {
          electionCountArray[index].push({
            'hc-key': e[index].stateData[i].key,
            'voteValue': countArray[i],
            'ahead': aheadArray[i],
            'winner': winnerArray[i],
          });
        }
      }

      // console.log(electionCountArray[index]);
      // console.log(color, party);
      templateSeries(party, electionCountArray[index], color);
      if (index >= 2) return false;
    });


  };

  var setValue = function(party, total, percent) {
    $('.candidate-president-' + party + ' meter').attr('value', percent);
    $('.candidate-president-' + party + ' .meter-gauge span').css('width', percent + '%');
    $('.candidate-president-' + party + ' .vote-percent span').text(percent);
    $('.candidate-president-' + party + ' .vote-total span').text(total.toLocaleString());
  };

  var getData = function(e) {
    //reset array
    electionCountArray = [[],[],[]];
    countArray = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
    aheadArray = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
    winnerArray = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
    candidate = [];
    flag = [];
    mapData.series = [];

    var getTotal = e[0].voteCount + e[1].voteCount + e[2].voteCount;
    var markup;

    $.each(e, function(key, val) {
      candidate.push(e[key].candidate);
      flag.push(e[key].partyName);
      if (e[key].selfAnnouces === true) $('.candidate-president-' + e[key].partyName + ' .candidate-elected').html('<div class="flag self-announces"></div>');
      if (e[key].elected === true) $('.candidate-president-' + e[key].partyName + ' .candidate-elected').html('<div class="flag elected"></div>');

      setValue(e[key].partyName, e[key].voteCount, (e[key].voteCount / getTotal * 100).toFixed(2));
      if (key >= 2) return false;
    });

    // setValue('mjd', e[0].voteCount, mjdCount);
    // setValue('gmd', e[1].voteCount, gmdCount);
    // setValue('qmd', e[2].voteCount, qmdCount);

    mapInject(e);
    htmlInject(e); // html code injection

    var chart = new Highcharts.Map(mapData);
    var map = new Highcharts.Chart(pieData);

    // console.log(mapData);

  };

  var testData = function(e){
    var getTotal = e[0] + e[1] + e[2];
    setValue('mjd', e[0], (e[0] / getTotal * 100).toFixed(2));
    setValue('gmd', e[1], (e[1] / getTotal * 100).toFixed(2));
    setValue('qmd', e[2], (e[2] / getTotal * 100).toFixed(2));
  };


  //getData from websocket
  socket.on('receiveChange', function(data) {
    getData(data);
  });


  //testData
  socket.on('textChange', function(data) {
    testData(data);
  });

  // getData();

  $('.extralink').on('click', function() {
    // window.open('http://vote2016.udn.com/vote2016/candidate_l', '_blank');
    socket.emit('jsonChange', 'i\'m calling json');
  });

  // setInterval(getData, 2000);
});
