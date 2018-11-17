<?php

namespace App\Controller;

use App\Command\BusStop\CreateBusStopCommand;
use App\Command\BusStop\DeleteBusStopCommand;
use App\Command\BusStop\UpdateBusStopCommand;
use App\Command\BusStopGroup\CreateBusStopGroupCommand;
use App\Command\BusStopGroup\DeleteBusStopGroupCommand;
use App\Command\BusStopGroup\UpdateBusStopGroupCommand;
use App\Query\GetAllBusStopGroupsQuery;
use App\Query\GetAllBusStopsQuery;
use CrEOF\Spatial\PHP\Types\Geometry\Point;
use Ramsey\Uuid\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Annotation\Route;

final class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function index(Request $request): Response
    {
        $data = [];
        return $this->render('default/index.html.twig', $data);
    }

    /**
     * @Route("/downloadData", name="downloadData")
     */
    public function downloadData(
        GetAllBusStopsQuery $getAllBusStops,
        GetAllBusStopGroupsQuery $getAllBusStopGroups
    ): Response
    {
        $data = [
            [
                'type' => 'busStop',
                'items' => $getAllBusStops(),
            ],
            [
                'type' => 'busStopGroup',
                'items' => $getAllBusStopGroups(),
            ],
        ];
        return new JsonResponse($data);
    }

    /**
     * @Route("/uploadData", name="uploadData")
     */
    public function uploadData(
        Request $request,
        MessageBusInterface $commandBus,
        GetAllBusStopsQuery $getAllBusStops,
        GetAllBusStopGroupsQuery $getAllBusStopGroups
    ): Response
    {
        foreach (json_decode($request->getContent(), true) as $data) {
            switch ($data['type']) {
                case 'busStop':
                    $busStops = $getAllBusStops();
                    foreach ($data['items'] as $item) {
                        $id = Uuid::fromString($item['id']);
                        $busStop = $busStops->get($id);
                        $busStopData = $item['data'];
                        if ($busStopData) {
                            $location = new Point($busStopData['location'][0], $busStopData['location'][1]);
                            $group = $busStopData['group'] ? Uuid::fromString($busStopData['group']) : null;
                            if ($busStop) {
                                $commandBus->dispatch(new UpdateBusStopCommand($id, $location, $group));
                            } else {
                                $commandBus->dispatch(new CreateBusStopCommand($id, $location, $group));
                            }
                        } elseif($busStop) {
                            $commandBus->dispatch(new DeleteBusStopCommand($id));
                        }

                    }
                    break;
                case 'busStopGroup':
                    $busStopGroups = $getAllBusStopGroups();
                    foreach ($data['items'] as $item) {
                        $id = Uuid::fromString($item['id']);
                        $busStopGroup = $busStopGroups->get($id);
                        $busStopGroupData = $item['data'];
                        if ($busStopGroupData) {
                            $name = $busStopGroupData['name'];
                            if ($busStopGroup) {
                                $commandBus->dispatch(new UpdateBusStopGroupCommand($id, $name));
                            } else {
                                $commandBus->dispatch(new CreateBusStopGroupCommand($id, $name));
                            }
                        } elseif($busStopGroup) {
                            $commandBus->dispatch(new DeleteBusStopGroupCommand($id));
                        }
                    }
                    break;
            }
        }
        return new JsonResponse([]);
    }
}